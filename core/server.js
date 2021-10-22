'use strict';

const Entry = require('./Entry');
const Environment = require('./Environment');
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
		data = data.toString();
		if(data === 'stop-http') {
			await http_server.stop();
			connection.write('stopped');
		}
		if(data === 'stop-local') {
			await local_server.stop();
			console.log('Server stopped');
		}
	});
}

const http_server = new ServerAgent(require('http'), HTTPListener, {}, Environment.port);
const local_server = new ServerAgent(require('net'), localListener, { allowHalfOpen: true }, Environment.pipe_file);

(async () => {
	try {
		require('fs').unlinkSync(Environment.pipe_file);
	} catch {}
	await http_server.start();
	await local_server.start();
	console.log('Server started');
})();
