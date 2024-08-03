const client = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.registerUser = async (req, res) => {
    const { email, password, name, isAdmin } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await client.query(
            'INSERT INTO users (email, password, name, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, email, name, is_admin',
            [email, hashedPassword, name, isAdmin || false]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
      if (result.rows.length === 0) {
          return res.status(400).json({ error: 'Credenciales incorrectas' })
      }

      const user = result.rows[0]
      const validPassword = await bcrypt.compare(password, user.password)
      
      if (!validPassword) {
          return res.status(400).json({ error: 'Credenciales incorrectas' })
      }

      const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.is_admin }, process.env.SECRET_KEY, { expiresIn: '1h' })
      res.json({ token, userId: user.id })

  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};


exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query('SELECT * FROM users WHERE id = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        let user = result.rows[0]
        delete user.password
        res.json(user)

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


//Admin get todos los pedidos
exports.getOrders = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        const result = await client.query('SELECT * FROM "order"')
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


//Crear Pedido
exports.createOrder = async (req, res) => {
    const { products, status } = req.body

    try {
        let totalMinutes = 0
        let totalPrice = 0

        for (const product of products) {
            const { product_id, quantity } = product
            const result = await client.query('SELECT * FROM product WHERE product_id = $1', [product_id])
            const prod = result.rows[0]
            if (prod) {
                totalMinutes += prod.minutes * quantity
                totalPrice += prod.price * quantity
            } else {
                console.error(`Product with id ${product_id} not found`)
            }
        }

        // Inserta el pedido
        const orderResult = await client.query(
            'INSERT INTO "order" (total_minutes, total_price, status) VALUES ($1, $2, $3) RETURNING order_id',
            [totalMinutes, totalPrice, status]
        )
        const orderId = orderResult.rows[0].order_id

        //Productos de tabla orderproduct
        for (const product of products) {
            const { product_id, quantity } = product
            const prodResult = await client.query('SELECT price, minutes FROM product WHERE product_id = $1', [product_id])
            const prod = prodResult.rows[0]
            if (prod) {
                await client.query(
                    'INSERT INTO OrderProduct (order_id, product_id, quantity, sub_total_price, sub_total_minutes) VALUES ($1, $2, $3, $4, $5)',
                    [orderId, product_id, quantity, prod.price * quantity, prod.minutes * quantity]
                );
            } else {
                console.error(`Product with id ${product_id} not found during OrderProduct insertion`)
            }
        }

        res.status(201).json({ order_id: orderId })
    } catch (err) {
        console.error('Error creating order:', err)
        res.status(500).json({ error: err.message })
    }
}
  
  
  exports.updateOrder = async (req, res) => {
    const { order_id } = req.params
    const { products, status } = req.body
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado' })
      }
  
      
      let totalMinutes = 0
      let totalPrice = 0
  
      for (const product of products) {
        const { product_id, quantity } = product
        const result = await client.query('SELECT * FROM product WHERE product_id = $1', [product_id])
        const prod = result.rows[0]

        if (prod) {
          totalMinutes += prod.minutes * quantity
          totalPrice += prod.price * quantity
        }
      }
  
      //Actualización del pedido
      const result = await client.query(
        'UPDATE "order" SET total_minutes = $1, total_price = $2, status = $3, updated_at = NOW() WHERE order_id = $4 RETURNING *',
        [totalMinutes, totalPrice, status, order_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' })
      }
  
      // Eliminar productos existentes del pedido
      await client.query('DELETE FROM OrderProduct WHERE order_id = $1', [order_id])
  
      //Actualizar los produtos en orderproduct
      for (const product of products) {
        const { product_id, quantity } = product;
        const prodResult = await client.query('SELECT price, minutes FROM product WHERE product_id = $1', [product_id])
        const prod = prodResult.rows[0]

        if (prod) {
          await client.query(
            'INSERT INTO OrderProduct (order_id, product_id, quantity, sub_total_price, sub_total_minutes) VALUES ($1, $2, $3, $4, $5)',
            [order_id, product_id, quantity, prod.price * quantity, prod.minutes * quantity]
          )
        }
      }
  
      res.json(result.rows[0])
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  };
  
  //Eliminar pedido
  exports.deleteOrder = async (req, res) => {
    const { order_id } = req.params
  
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado' })
      }
  
      //Verificar pedido
      const orderResult = await client.query('SELECT * FROM "order" WHERE order_id = $1', [order_id])
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' })
      }
  
      //Eliminar en orderproduct
      await client.query('DELETE FROM OrderProduct WHERE order_id = $1', [order_id])

      const result = await client.query('DELETE FROM "order" WHERE order_id = $1 RETURNING *', [order_id])
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No se pudo encontrar el pedido para eliminar' })
      }
  
      res.json({ message: 'Pedido eliminado correctamente' })
    }
    
    catch (err) {
      console.error(err)
      res.status(500).json({ error: err.message })
    }
  }




  exports.getProducts = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Acceso denegado' })
        }

        const result = await client.query('SELECT * FROM product')
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
};

//Crear producto
exports.createProduct = async (req, res) => {
  const { name, description, price, minutes, category, image_link } = req.body

  try {
      if (!req.user.isAdmin) {
          return res.status(403).json({ error: 'Acceso denegado' })
      }

      const result = await client.query(
          'INSERT INTO product (name, description, price, minutes, category, image_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [name, description, price, minutes, category, image_link]
      );

      res.status(201).json(result.rows[0])
  } catch (err) {
      res.status(500).json({ error: err.message })
  }
}


//Actualizar
exports.updateProduct = async (req, res) => {
  const { product_id } = req.params
  const { name, description, price, minutes, category, image_link } = req.body;

  try {
      if (!req.user.isAdmin) {
          return res.status(403).json({ error: 'Acceso denegado' })
      }

      const result = await client.query(
          'UPDATE product SET name = $1, description = $2, price = $3, minutes = $4, category = $5, image_link = $6, updated_at = NOW() WHERE product_id = $7 RETURNING *',
          [name, description, price, minutes, category, image_link, product_id]
      )

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Producto no encontrado' })
      }

      res.json(result.rows[0])
  }

  catch (err) {
      res.status(500).json({ error: err.message })
  }
}

//Eliminar
exports.deleteProduct = async (req, res) => {
    const { product_id } = req.params

    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Acceso denegado' })
        }

        const result = await client.query('DELETE FROM product WHERE product_id = $1 RETURNING *', [product_id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        res.json({ message: 'Producto eliminado correctamente' })
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}