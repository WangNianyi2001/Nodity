'use strict';

const ProFile = require('./ProFile');

function Request(req) {
	this.req = req;
	const url = req.headers.host + req.url;
	this.path = ProFile.Path.fromURL(url);
}

module.exports = Request;
