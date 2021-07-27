'use strict';

const http = require('http');
const getEntry = require('./core/getEntry');
const port = require('./core/port');

http.createServer((req, res) => {
	const query = getEntry(req.url);
	if(!query) {
		res.writeHead(404);
		res.end();
		return;
	}
	query.handle(req, res);
}).listen(port);
