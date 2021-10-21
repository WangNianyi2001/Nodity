'use strict';

const fs = require('fs');

const args = Array.prototype.slice.call(process.argv, 2);

function serverRunning() {
	return fs.existsSync('./runtime/server.lock');
}

function getClient() {
	if(!serverRunning())
		return null;
	const net = require('net');
	const pipeFile = require('./core/pipeFile');
	return net.connect(pipeFile);
}

function startServer() {
	if(getClient()) {
		console.error('The server is already running');
		return;
	}
	console.log('Starting the server');
	const { spawn } = require('child_process');
	try {
		const proc = spawn('node', ['./core/server.js'], {
			stdio: 'pipe'
		});
		proc.stdout.on('data', data => console.log(data.toString()));
		proc.stderr.on('data', data => console.error(data.toString()));
	} catch(e) {
		console.error('Failed to start the server');
		console.error(e);
	}
}

function stopServer() {
	const client = getClient();
	if(!client) {
		console.error('The server is not running');
		return;
	}
	console.log('Stopping the server');
	client.write('stop');
	setTimeout(() => client.destroy(), 100);
}

switch(args[0]) {
	case 'start': {
		startServer();
		break;
	}
	case 'stop': {
		stopServer();
		break;
	}
	case 'restart': {
		stopServer();
		startServer();
		break;
	}
}
