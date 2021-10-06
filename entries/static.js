'use strict';

const readFile = require('../core/readFile');

module.exports = require('../core/respond')((req, res) => {
	const src = req.dir.join('/');
	const file = readFile(src) || readFile(src + '/index.html');
	if(!file)
		return 404;
	const header = {};
	if(file.type && file.type.mime)
		header.MimeType = file.type.mime;
	res.writeHead(200, header);
	res.write(file.content);
});
