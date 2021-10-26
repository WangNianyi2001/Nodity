'use strict';

const net = require('net');
const env = require('./core/env');
const { fork } = require('child_process');

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
	console.log('Starting Nodity server');
	const child = fork('./core/server.js', {
		stdio: 'inherit',
		// detached: true
	});
	await new Promise(res => child.once('message', res));
	console.log('Starting local server')
	child.send('{ "command": "start-local" }');
	await new Promise(res => child.once('message', res));
	console.log('Local server started');
	console.log('Starting web server');
	const connect = await getConnect();
	sendCommand(connect, 'start-web');
	await new Promise(res => connect.once('data', res));
	console.log('Web server started');
	console.log('Nodity server started');
	child.unref();
}

async function stopServer() {
	const connect = await getConnect();
	if(!connect)
		return console.error('The server is not running');
	console.log('Stopping Nodity server');
	console.log('Stopping web server');
	sendCommand(connect, 'stop-web');
	await new Promise(res => connect.once('data', res));
	console.log('Web server stopped');
	console.log('Stopping local server');
	sendCommand(connect, 'stop-local');
	connect.end();
	console.log('Local server stopped');
	console.log('Nodity server stopped');
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
