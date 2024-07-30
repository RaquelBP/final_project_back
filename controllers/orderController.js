const client = require('../db')
const { sendOrderCompletionEmail } = require('./emailController.js');

exports.handleOrder = async (req, res) => {
    const { products, userEmail } = req.body;

    //console.log(products)

    
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'No products provided' })
    }

    
    let final_minutes = []
    let final_prices = []
    products.forEach((product) => {
       
        const minutes = parseFloat(product.sub_preparation_minutes)
        const price = parseFloat(product.sub_total_price)

        if (!isNaN(minutes) && !isNaN(price)) {
            final_minutes.push(minutes)
            final_prices.push(price)
        } else {
            console.error('Invalid data in product:', product)
        }
    });

    const total_price = final_prices.reduce((partialSum, a) => partialSum + a, 0)
    const total_minutes = final_minutes.reduce((partialSum, a) => partialSum + a, 0)

    try {
        
        const orderQuery = `
            INSERT INTO "order" (total_price, total_minutes, status, user_email)
            VALUES ($1, $2, $3, $4)
            RETURNING order_id, created_at
        `;
        const orderValues = [total_price, total_minutes, 'pending', userEmail || null]
        const orderResult = await client.query(orderQuery, orderValues)
        const orderId = orderResult.rows[0].order_id
        const orderCreatedAt = orderResult.rows[0].created_at

        
        const orderProductPromises = products.map(product => {
            
            const minutes = parseFloat(product.sub_preparation_minutes)
            if (isNaN(minutes)) {
                throw new Error(`Invalid sub_preparation_minutes for product_id ${product.product_id}`)
            }

            return client.query(
                'INSERT INTO OrderProduct (order_id, product_id, quantity, sub_total_price, sub_total_minutes) VALUES ($1, $2, $3, $4, $5)',
                [orderId, product.product_id, product.quantity, product.sub_total_price, minutes]
            );
        });
        await Promise.all(orderProductPromises);

        
        if (userEmail) {
            const orderInformation = `
                Gracias por completar tu compra en McDowell's. ¡En unos minutos tendrás la comida en tus manos!
                Esta es la información detallada de tu pedido:

                ID del pedido: ${orderId}
                Fecha del pedido: ${orderCreatedAt}


                Detalles del pedido:
                ${products.map(product => `
                Producto: ${product.product_name}
                Cantidad: ${product.quantity}
                Precio Unitario: ${(product.sub_total_price / product.quantity).toFixed(2)}€
                Precio Total del producto: ${product.sub_total_price.toFixed(2)}€
                `).join('\n')}

                Precio total del pedido: ${total_price.toFixed(2)}€
                Tiempo estimado de preparación: ${total_minutes} minutos
            `;

            sendOrderCompletionEmail(userEmail, orderInformation);
        }

        /*
        console.log(`Detalles del pedido (ID: ${orderId}, Fecha: ${orderCreatedAt}):`)
        products.forEach((product) => {
            if(product.name){
                console.log("Nombre:", product.product_name)
            }
            console.log(`Producto ID: ${product.product_id}, Cantidad: ${product.quantity}, Precio Unitario: ${product.sub_total_price / product.quantity}, Precio Total: ${product.sub_total_price}`)
        });
        console.log(`Precio total del pedido: ${total_price}`);
        */

        res.status(201).json({ message: 'Order created successfully', orderId })
    } catch (err) {
        console.error('Error creating order:', err)
        res.status(500).json({ error: err.message })
    }
};
