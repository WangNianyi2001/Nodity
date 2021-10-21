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

const net = require('net');
const fs = require('fs');

const pipeFile = require('./pipeFile');

const local_server = net.createServer({
	allowHalfOpen: true
}, connection => {
	connection.on('data', data => {
		data = data.toString();
		if(data === 'stop')
			stopServer();
	});
	connection.pipe(connection);
});

try {
	fs.unlinkSync(pipeFile);
} catch (error) {}

function startServer() {
	http_server.listen(port);
	local_server.listen(pipeFile);
	console.log(process.cwd());
	fs.writeFileSync('./runtime/server.lock', process.pid.toString());
	console.log('Server started');
}

function stopServer() {
	http_server.once('close', () => {
		fs.rmSync('./runtime/server.lock');
		console.log('Server stopped');
		local_server.close();
	});
	http_server.close();
}

startServer();
