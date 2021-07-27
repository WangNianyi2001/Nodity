const readFile = require('./core/readFile');
module.exports = +readFile('./conf/port', 'utf-8');
