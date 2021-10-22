'use strict';

const args = Array.prototype.slice.call(process.argv, 2);

async function getClient() {
	const net = require('net');
	const pipeFile = require('./core/pipeFile');
	const socket = net.connect(pipeFile);
	return new Promise(res => {
		socket.once('error', () => res(null));
		socket.once('connect', () => res(socket));
	});
}

async function startServer() {
	if(await getClient()) {
		console.error('The server is already running');
		return;
	}
	console.log('Starting the server');
	const { spawn } = require('child_process');
	spawn('node', ['./core/server.js'], { stdio: 'inherit' });
}

async function stopServer() {
	const client = await getClient();
	if(!client) {
		console.error('The server is not running');
		return;
	}
	console.log('Stopping the server');
	client.write('stop');
	return new Promise(res => {
		client.once('data', () => {
			client.destroy();
			res();
		});
	});
}

(async function() {
	switch(args[0]) {
		case 'start': {
			await startServer();
			break;
		}
		case 'stop': {
			await stopServer();
			break;
		}
		case 'restart': {
			await stopServer();
			await startServer();
			break;
		}
	}
})();
