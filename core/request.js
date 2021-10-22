'use strict';

const Path = require('./Path');

function Request(req) {
	this.req = req;
	const url = req.headers.host + req.url;
	this.path = Path.fromURL(url);
}

module.exports = Request;
