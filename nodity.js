'use strict';

const net = require('net');
const Environment = require('./core/Environment');
const { spawn } = require('child_process');

async function getClient() {
	const socket = net.connect(Environment.pipe_file);
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
