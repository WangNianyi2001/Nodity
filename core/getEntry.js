'use strict';

const readFile = require('../core/readFile');

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
	const json = JSON.parse(readFile('./conf/entries.json').content);
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

function getEntry(path) {
	const entry = root.find(path.slice());
	return entry && entry.handler && new Query(entry, path);
}

load();

module.exports = getEntry;
