const client = require('../db')

exports.getProducts = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM product')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
};
