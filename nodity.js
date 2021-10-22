'use strict';

const net = require('net');
const env = require('./core/env');
const { spawn } = require('child_process');
const { connect } = require('http2');

async function getConnect() {
	const socket = net.connect(env.pipe_file);
	return new Promise(res => {
		socket.once('error', res.bind(null, null));
		socket.once('connect', res.bind(null, socket));
	});
}

function sendCommand(connect, command, args = {}) {
	connect.write(JSON.stringify({ command, args }));
}

async function startServer() {
	if(await getConnect())
		return console.error('The server is already running');
	console.log('Starting the server');
	spawn('node', ['./core/server.js'], { stdio: 'inherit' });
}

async function stopServer() {
	const connect = await getConnect();
	if(!connect)
		return console.error('The server is not running');
	console.log('Stopping the HTTP server');
	sendCommand(connect, 'stop-http');
	await new Promise(res => connect.once('data', res));
	console.log('Stopping the local server')
	sendCommand(connect, 'stop-local');
	connect.end();
}

function distributeCommand(distributor, argv) {
	const command = argv.shift();
	if(!distributor.hasOwnProperty(command))
		return console.error(`No such command '${command}'`);
	distributor[command].apply(null, argv);
}
distributeCommand({
	'start': startServer,
	'stop': stopServer,
	async 'restart'() {
		await stopServer();
		await startServer();
	}
}, Array.prototype.slice.call(process.argv, 2));
