'use strict';

const Entry = require('./Entry');
const Request = require('./Request');
const env = require('./env');

function ServerAgent(proto, listener, options, port) {
	this.server = proto.createServer(options, listener);
	this.port = port;
	const sockets = this.sockets = new Set();
	this.server.on('connection', function(socket) {
		sockets.add(socket);
		this.once('close', () => sockets.delete(socket));
	});
}
ServerAgent.prototype = {
	async start() {
		this.server.listen(this.port);
	},
	async stop() {
		this.server.close();
		for(const socket of this.sockets)
			socket.destroy();
		return new Promise(res => this.server.once('close', res));
	}
};

const local_commands = {
	async 'stop-http'() {
		await http_server.stop();
		this.write('http-stopped');
	},
	async 'stop-local'() {
		await local_server.stop();
	}
};

function HTTPListener(req, res) {
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
}
function localListener(connection) {
	connection.on('data', async data => {
		try {
			const { command, args } = JSON.parse(data.toString());
			if(!local_commands.hasOwnProperty(command))
				throw 'Invalid nodity command: ' + data;
			await local_commands[command].call(connection, args);
		} catch(e) {
			console.error(e);
		}
	});
}

const http_server = new ServerAgent(require('http'), HTTPListener, {}, env.port);
const local_server = new ServerAgent(require('net'), localListener, { allowHalfOpen: true }, env.pipe_file);

(async () => {
	try {
		require('fs').unlinkSync(env.pipe_file);
	} catch {}
	console.group();
	console.group('Starting local server');
	await local_server.start();
	console.log('Local server started');
	console.groupEnd();
	console.group('Starting HTTP server');
	await http_server.start();
	console.log('HTTP server started');
	console.groupEnd();
	console.groupEnd();
	console.log('Nodity server started');
})();
