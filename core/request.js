'use strict';

const URL = require('url');

function Request(req) {
	this.url = URL.parse(req.url);
	this.dir = this.url.pathname.slice(1).split('/').map(decodeURIComponent);
}

module.exports = Request;
