const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

//Rutas de autenticación y usuario
router.post('/login', userController.loginUser)
router.post('/register', userController.registerUser)

router.get('/:id', authMiddleware, userController.getUser)
router.get('/admin/orders', authMiddleware, userController.getOrders)

module.exports = router
