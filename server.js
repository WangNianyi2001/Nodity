'use strict';

const http = require('http');
const findEntry = require('./core/findEntry');
const readFile = require('./core/readFile');
const port = parseInt(readFile('./conf/port', 'utf-8').content);
const Request = require('./core/request');

http.createServer((req, res) => {
	const request = new Request(req);
	const entry = findEntry(request.dir.slice());
	if(!entry) {
		res.writeHead(404);
		res.end();
		return;
	}
	try {
		entry.handler(request, res);
	} catch(e) {
		res.writeHead(505);
		res.write(e.toString());
		res.end();
	}
}).listen(port);
