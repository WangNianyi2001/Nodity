const readFile = require('./readFile');
module.exports = +(readFile('./conf/port', 'utf-8').content);
