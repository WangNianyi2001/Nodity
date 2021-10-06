'use strict';

const http = require('http');
const findEntry = require('./core/findEntry');
const readFile = require('./core/readFile');
const port = parseInt(readFile('./conf/port', 'utf-8').content);

http.createServer((req, res) => {
	const entry = findEntry(req.url);
	if(!entry) {
		res.writeHead(404);
		res.end();
		return;
	}
	try {
		entry(req, res);
	} catch(e) {
		res.writeHead(505);
		res.write(e);
		res.end();
	}
}).listen(port);
