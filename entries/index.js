'use strict';

module.exports = require('../core/respond')((req, res) => {
	res.writeHead(200, { MimeType: 'text' });
	res.write('index');
});
