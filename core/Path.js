'use strict';

const { parse: parseURL } = require('url');

function trimRelativeLocators(dir) {
	let uptrace = 0;
	for(let i = 0; i < dir.length; ) {
		const current = dir[i];
		if(current[0] !== '.') {
			++i;
			continue;
		}
		if(current === '.') {
			dir.splice(i, 1);
		} else if(current === '..') {
			if(i > 0)
				dir.splice(i - 1, 2);
			else {
				dir.shift();
				++uptrace;
			}
		}
	}
	return uptrace;
}

function Path(dir, base = null) {
	if(!(this instanceof Path)) {
		if(dir instanceof Path && !base)
			return dir;
		return new Path(...arguments);
	}
	if(base)
		return Path(base).navigate(dir);
	this.dir = [];
	switch(true) {
		case dir instanceof Path:
			this.dir.push(...dir.dir);
			break;
		case dir instanceof Array:
			this.dir.push(...dir);
			break;
		case typeof dir === 'string':
			this.dir.push(...dir.split('/'));
			break;
	}
	this.uptrace = 0;
	this.trim();
}
Path.prototype = {
	get last() {
		return this.dir.length ? null : this.dir[this.dir.length - 1];
	},
	get length() {
		return this.dir.length;
	},
	trim() {
		this.uptrace += trimRelativeLocators(this.dir);
		return this;
	},
	eat(n) {
		const res = new Path(this);
		const m = Math.min(n, res.uptrace, 0);
		n -= m;
		res.uptrace -= m;
		res.dir.splice(0, n);
		return res.trim();
	},
	navigate(path) {
		path = Path(path);
		const res = new Path(this);
		for(let t = path.uptrace; t > 0; --t) {
			if(res.dir.length)
				res.dir.pop();
			else {
				res.uptrace += t;
				break;
			}
		}
		res.dir.push(...path.dir);
		return res;
	},
	toLocal() {
		return this.dir.join('/');
	},
	toString() {
		return this.dir.toString();
	}
};

const id = x => x;
const trusy = x => !!x;

Path.makeFactor = (extractor, decoder, modifier = id, post = id) =>
	(path, base = null) => post(new Path(
		modifier(extractor(path).split('/').map(decoder)),
		base
	), path, base);

Path.fromLocal = Path.makeFactor(id, component => component.toString().replace(/\\(?!\\)/g, ''));
Path.fromURL = Path.makeFactor(
	(url => parseURL(url).pathname),
	decodeURIComponent,
	arr => arr.slice(1).filter(trusy),
	(path, url) => { path.url = parseURL(url); return path; }
);

module.exports = Path;
