'use strict';

const args = Array.prototype.slice.call(process.argv, 2);

const getClient = () => {
	try {
		const net = require('net');
		const pipeFile = require('./core/pipeFile');
		return net.connect(pipeFile);
	} catch { return null; }
};

switch(args[0]) {
	case 'start': {
		const { spawn } = require('child_process');
		const proc = spawn('node', ['./core/server.js'], {
			stdio: 'pipe',
			detached: true
		});
		proc.stdout.on('data', data => console.log(data.toString()));
		proc.stderr.on('data', data => console.error(data.toString()));
		break;
	}
	case 'stop': {
		const client = getClient();
		if(!client)
			break;
		client.write('stop');
		client.once('data', () => client.destroy());
		break;
	}
}
