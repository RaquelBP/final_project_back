const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

//Login
router.post('/login', userController.loginUser)

router.get('/:id', authMiddleware, userController.getUser)

//Pedidos
router.get('/admin/orders', authMiddleware, userController.getOrders)
router.post('/admin/orders', authMiddleware, userController.createOrder);
router.put('/admin/orders/:order_id', authMiddleware, userController.updateOrder)
router.delete('/admin/orders/:order_id', authMiddleware, userController.deleteOrder)

//Productos
router.get('/admin/products', authMiddleware, userController.getProducts)
router.post('/admin/products', authMiddleware, userController.createProduct)
router.put('/admin/products/:product_id', authMiddleware, userController.updateProduct)
router.delete('/admin/products/:product_id', authMiddleware, userController.deleteProduct)

module.exports = router
