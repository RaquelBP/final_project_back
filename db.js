const { Client } = require('pg')
require('dotenv').config()

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: true
});

client.connect(err => {
  if (err) {
    console.error('Connection error', err.stack)
  } else {
    console.log('Connected to database')
  }
});

module.exports = client;
