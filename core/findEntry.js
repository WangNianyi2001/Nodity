'use strict';

const readFile = require('./readFile');

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
		const sub_name = dir.length ? dir.shift() : '';
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

const root = generateEntry(JSON.parse(readFile('./conf/entries.json').content));

module.exports = path => root.find(path.dir.slice());
