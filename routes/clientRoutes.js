const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const orderController = require("../controllers/orderController")

router.get('/');
router.post('/order', orderController.handleOrder)
router.post('/order/:id/ticket')

router.get('/products', productController.getProducts)


module.exports = router