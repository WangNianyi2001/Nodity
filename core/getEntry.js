'use strict';

const URL = require('url');
const fs = require('fs');

function getHandler(src) {
	try {
		const mod = require(src);
		return mod;
	} catch(e) {
		return null;
	}
}

class Entry {
	constructor(src) {
		this.subs = new Map();
		this.src = src;
		this.handler = null;
		try {
			this.handler = getHandler('../entries/' + src);
		} catch(e) {}
	}
	add(name, src) {
		const sub = new Entry(src);
		this.subs.add(name, sub);
	}
	find(dir) {
		const sub_name = dir.shift();
		if(this.subs.has(sub_name))
			return this.subs.get(sub_name).find(dir);
		return this;
	}
}

function generateEntry(structure, src) {
	const root = new Entry(src);
	for(const name in structure) {
		const substruct = structure[name];
		const sub = typeof substruct === 'string' ?
			new Entry(substruct) :
			generateEntry(substruct.subs || {}, substruct.src);
		root.subs.set(name, sub);
	}
	return root;
}

let root;

function load() {
	const json = JSON.parse(fs.readFileSync(
		'./conf/entries.json', { encoding: 'utf-8' }
	));
	root = generateEntry(json);
}

class Query {
	constructor(entry, dir) {
		this.entry = entry;
		this.dir = dir;
	}
	handle(req, res) {
		return this.entry.handler(req, res);
	}
};

function getEntry(url) {
	try {
		const path = URL.parse(url).pathname;
		const dir = path.slice(1).split('/');
		const entry = root.find(dir);
		return entry && entry.handler && new Query(entry, dir);
	} catch(e) {
		return null;
	}
}

load();

module.exports = getEntry;
