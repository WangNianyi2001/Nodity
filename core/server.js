'use strict';

const http = require('http');
const findEntry = require('./findEntry');
const readFile = require('./readFile');
const port = parseInt(readFile('./conf/port', 'utf-8').content);
const Request = require('./request');

const http_server = http.createServer((req, res) => {
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
});
http_server.listen(port);

const net = require('net');
const fs = require('fs');

const pipeFile = require('./pipeFile');

const local_server = net.createServer({
	allowHalfOpen: true
}, connection => {
	connection.on('data', data => {
		data = data.toString();
		if(data === 'stop') {
			http_server.close();
			http_server.once('close', () => {
				console.log('Server stopped');
				connection.write('');
				local_server.close();
			});
		}
	});
	connection.pipe(connection);
})

try {
	fs.unlinkSync(pipeFile);
} catch (error) {}

local_server.listen(pipeFile);

console.log('Server started');
