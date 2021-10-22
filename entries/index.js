'use strict';

module.exports = require('../core/Respond')(({ res }) => {
	res.writeHead(200, { MimeType: 'text' });
	res.write('index');
});
