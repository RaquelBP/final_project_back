const client = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales incorrectas' })
    }
    const user = result.rows[0]
    //const validPassword = await bcrypt.compare(password, user.password)
    //if (!validPassword) {
    //  return res.status(400).json({ error: 'Credenciales incorrectas' })
    //}
    const token = jwt.sign({ id: user.id, email: user.email }, "screto", { expiresIn: '1h' })
    res.json({ token, userId: user.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
};
