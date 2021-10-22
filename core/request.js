'use strict';

const URL = require('url');

function Request(req) {
	this.req = req;
	this.url = new URL(req.url);
	this.dir = this.url.pathname.slice(1).split('/').map(decodeURIComponent).filter(x => !!x);
}

module.exports = Request;
