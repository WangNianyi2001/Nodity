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
	async 'start-local'() {
		try {
			require('fs').unlinkSync(env.pipe_file);
		} catch {}
		await local_server.start();
		this.send('local-started');
	},
	async 'start-http'() {
		await http_server.start();
		this.write('http-started');
	},
	async 'stop-http'() {
		await http_server.stop();
		this.write('http-stopped');
	},
	async 'stop-local'() {
		await local_server.stop();
	}
};
async function commandListener(data) {
	try {
		const { command, args } = JSON.parse(data.toString());
		if(!local_commands.hasOwnProperty(command))
			throw 'Invalid nodity command: ' + data;
		await local_commands[command].call(this, args);
	} catch(e) {
		console.error(e);
	}
}

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
	connection.on('data', commandListener.bind(connection));
}

const http_server = new ServerAgent(require('http'), HTTPListener, {}, env.port);
const local_server = new ServerAgent(require('net'), localListener, { allowHalfOpen: true }, env.pipe_file);
process.on('message', commandListener);

process.send('start');
