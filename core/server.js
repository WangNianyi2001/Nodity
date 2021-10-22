'use strict';

const Entry = require('./Entry');
const env = require('./env');
const Request = require('./Request');

function ServerAgent(proto, listener, options, port) {
	this.server = proto.createServer(options, listener);
	this.port = port;
}
ServerAgent.prototype = {
	async start() {
		this.server.listen(this.port);
	},
	async stop() {
		this.server.close();
		return new Promise(res => this.server.once('close', res));
	}
};

const local_commands = {
	async 'start'() {
		await http_server.start();
		console.log('Server started');
	},
	async 'stop-http'() {
		await http_server.stop();
		this.write('http-stopped');
	},
	async 'stop-local'() {
		await local_server.stop();
		console.log('Server stopped');
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

try {
	require('fs').unlinkSync(env.pipe_file);
} catch {}
local_server.start();
