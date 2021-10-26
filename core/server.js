'use strict';

const Entry = require('./Entry');
const Request = require('./Request');
const env = require('./env');
const fs = require('fs');

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
		return new Promise(res => this.server.once('listening', res));
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
	async 'start-web'() {
		await web_server.start();
		this.write('web-started');
	},
	async 'stop-web'() {
		await web_server.stop();
		this.write('web-stopped');
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

function webListener(req, res) {
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

const web_server = new ServerAgent(require('https'), webListener, {
	key: fs.readFileSync('conf/key.pem'),
	cert: fs.readFileSync('conf/cert.pem')
}, env.port);
const local_server = new ServerAgent(require('net'), localListener, { allowHalfOpen: true }, env.pipe_file);
process.on('message', commandListener);

process.send('start');
