'use strict';

const http = require('http');
const findEntry = require('./findEntry');
const readFile = require('./readFile');
const port = parseInt(readFile('./conf/port', 'utf-8').content);
const Request = require('./request');

const http_server = http.createServer((req, res) => {
	const request = new Request(req);
	const entry = findEntry(request.path);
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

const net = require('net');
const fs = require('fs');

const pipeFile = require('./pipeFile');

const local_server = net.createServer({
	allowHalfOpen: true
}, connection => {
	connection.on('data', data => {
		data = data.toString();
		if(data === 'stop')
			stopServer(connection);
	});
	connection.pipe(connection);
});

try {
	fs.unlinkSync(pipeFile);
} catch (error) {}

function startServer() {
	http_server.listen(port);
	local_server.listen(pipeFile);
	console.log('Server started');
}

async function stopServer(connection) {
	http_server.close();
	await new Promise(res => {
		connection.write('');
		http_server.once('close', res);
	});
	local_server.close();
	await new Promise(res => local_server.once('close', res));
	console.log('Server stopped');
}

startServer();
