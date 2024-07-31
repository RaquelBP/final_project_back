const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {

        console.log("AuthMiddleware no token")

        return res.status(401).json({ error: 'Acceso denegado, no token proporcionado' })
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded

        console.log("AuthMiddleware decoded:", decoded)

        next()
    } catch (err) {

        console.log("AuthMiddleware error:", err)

        res.status(400).json({ error: 'Token inválido' })
    }
};



