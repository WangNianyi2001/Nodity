'use strict';

const http = require('http');
const Entry = require('./Entry');
const Environment = require('./Environment');
const Request = require('./Request');

const http_server = http.createServer((req, res) => {
	const request = new Request(req);
	const entry = Entry.find(request.path);
	if(!entry) {
		res.writeHead(404);
		res.end();
		return;
	}
	try {
		entry.handle(request, res);
	} catch(e) {
		res.writeHead(505);
		res.write(e.toString());
		res.end();
	}
});

const net = require('net');
const fs = require('fs');

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
	fs.unlinkSync(Environment.pipe_file);
} catch (error) {}

function startServer() {
	http_server.listen(Environment.port);
	local_server.listen(Environment.pipe_file);
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
