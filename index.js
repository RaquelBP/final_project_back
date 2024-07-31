const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');

const clientRoutes = require('./routes/clientRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use('/', clientRoutes); //Tienda Index cliente

app.use('/users', userRoutes)

app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});