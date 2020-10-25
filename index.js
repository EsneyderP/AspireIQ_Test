/**
 *
 * Author:  Jhoan Esneyder Peña
 * Email: esneideramy@gmail.com
 *
 * License: MIT - Copyright (c) Jhoan Esneyder Peña
 * @link 
 *
 */

const express    = require('express');

/* Make all variables from our .env file available in our process */
require('dotenv').config();

/* Init express */
const app = express();

const port = process.env.PORT || 3000;
const address = process.env.SERVER_ADDRESS || '127.0.0.1';

app.listen( port, address, () => console.log(`Server running on http://${address}:${port}`));

module.exports = app;