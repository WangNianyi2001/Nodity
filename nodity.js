'use strict';

const net = require('net');
const pipeFile = require('./core/pipeFile');
const { spawn } = require('child_process');

async function getClient() {
	const socket = net.connect(pipeFile);
	return new Promise(res => {
		socket.once('error', res.bind(null, null));
		socket.once('connect', res.bind(null, socket));
	});
}

async function startServer() {
	if(await getClient())
		return console.error('The server is already running');
	console.log('Starting the server');
	spawn('node', ['./core/server.js'], { stdio: 'inherit' });
}

async function stopServer() {
	const client = await getClient();
	if(!client)
		return console.error('The server is not running');
	console.log('Stopping the server');
	client.write('stop');
	return new Promise(res => client.once('data', () => res(client.destroy())));
}

const args = Array.prototype.slice.call(process.argv, 2);

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
