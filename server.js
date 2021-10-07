'use strict';

const http = require('http');
const findEntry = require('./core/findEntry');
const readFile = require('./core/readFile');
const port = parseInt(readFile('./conf/port', 'utf-8').content);
const Request = require('./core/request');

http.createServer((req, res) => {
	const request = new Request(req);
	const entry = findEntry(request);
	if(!entry) {
		res.writeHead(404);
		res.end();
		return;
	}
	try {
		entry(request, res);
	} catch(e) {
		res.writeHead(505);
		res.write(e);
		res.end();
	}
}).listen(port);
