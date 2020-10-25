/**
 *
 * Author:  Jhoan Esneyder Peña
 * Email: esneideramy@gmail.com
 * Decription: A helper module that allows to get the JSON document that is going to be tested
 * License: MIT - Copyright (c) Jhoan Esneyder Peña
 * @link https://github.com/EsneyderP/AspireIQ_Test
 *
 */

const dummy_data = require ('./dummy/dummy_data');

module.exports = {
    get: function() {
        return dummy_data.doc;
    }
}