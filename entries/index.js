'use strict';

module.exports = require('../core/respond')(({ res }) => {
	res.writeHead(200, { MimeType: 'text' });
	res.write('index');
});
