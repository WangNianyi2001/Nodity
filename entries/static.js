'use strict';

const readFile = require('../core/readFile');

const static_root = 'static/';

module.exports = require('../core/respond')((req, res) => {
	const src = static_root + req.dir.join('/');
	const file = readFile(src) || readFile(src + '/index.html');
	if(!file)
		return 404;
	const header = {};
	if(file.type && file.type.mime)
		header.MimeType = file.type.mime;
	res.writeHead(200, header);
	res.write(file.content);
});
