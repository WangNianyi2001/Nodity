'use strict';

const { readFile } = require('./ProFile');

module.exports = {
	pipe_file: process.platform === 'win32' ? '//./pipe/nodity' : '/tmp/nodity.sock',
	port: +(readFile('./conf/port', 'utf-8').content),
};
