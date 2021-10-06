'use strict';

const http = require('http');
const getEntry = require('./core/getEntry');
const readFile = require('./core/readFile');
const getPort = () => parseInt(readFile('./conf/port', 'utf-8').content);

http.createServer((req, res) => {
	const query = getEntry(req.url);
	if(!query) {
		res.writeHead(404);
		res.end();
		return;
	}
	query.handle(req, res);
}).listen(getPort());
