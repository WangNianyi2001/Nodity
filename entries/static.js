'use strict';

const readFile = require('../core/readFile');

module.exports = require('../core/respond')((req, res) => {
	const src = req.dir.join('/');
	const file = readFile(src) || readFile(src + '/index.html');
	if(!file)
		return 404;
	res.writeHead(200, file.type && file.type.mime ? { MimeType: file.type.mime } : {});
	res.write(file.content);
});
