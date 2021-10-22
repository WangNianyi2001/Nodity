'use strict';

const { readFile } = require('../core/ProFile');

const static_root = 'static/';

module.exports = require('../core/respond')(({ path, res }) => {
	const src = static_root + path.toLocal();
	const file = readFile(src) || readFile(src + '/index.html');
	if(!file)
		return 404;
	const header = {};
	if(file.type && file.type.mime)
		header.MimeType = file.type.mime;
	res.writeHead(200, header);
	res.write(file.content);
});
