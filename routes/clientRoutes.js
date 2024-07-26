const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const orderController = require("../controllers/orderController")

router.get('/');
router.post('/order', orderController.handleOrder); //Crea el pedido
router.post('/order/:id/ticket'); //Envia el ticket por email

//ESTO VA AL ADMIN PANEL??
router.get('/products', productController.getProducts)
router.get('/orders')



module.exports = router