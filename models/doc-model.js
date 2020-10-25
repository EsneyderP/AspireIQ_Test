const dummy_data = require ('./dummy/dummy_data');

module.exports = {
    get: function() {
        return dummy_data.doc;
    }
}