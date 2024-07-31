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
