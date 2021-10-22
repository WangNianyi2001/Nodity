'use strict';

const { readFile } = require('./ProFile');
const Path = require('./Path');

class HandlerContext {
	constructor(entry, req, res) {
		this.entry = entry;
		this.req = req;
		this.res = res;
		this.path = req.path.eat(entry.path.length);
	}
}

class Entry {
	constructor(src, path) {
		this.children = new Map();
		this.src = src;
		this.path = new Path(path);
		this.handler = null;
		try {
			this.handler = require('../entries/' + src);
		} catch(e) {
			console.error(`Unable to load entry '${this.path.toLocal()}' at ${this.src}`);
		}
	}
	find(dir) {
		const child_name = dir.length ? dir.shift() : '';
		if(this.children.has(child_name))
			return this.children.get(child_name).find(dir);
		return this;
	}
	handle(req, res) {
		if(!this.handler)
			throw `Handler ${this.path.last} does not exist`;
		const context = new HandlerContext(this, req, res);
		return this.handler(context);
	}
}

function generateEntry(raw, src, path = new Path()) {
	const root = new Entry(src, path);
	for(const name in raw) {
		const _path = path.navigate(name);
		const raw_child = raw[name];
		const child = typeof raw_child === 'string' ?
			new Entry(raw_child, _path) :
				raw_child.hasOwnProperty('children') ?
					generateEntry(raw_child['children'] || {}, raw_child.src, _path) :
					new Entry(raw_child.src, _path);
		root.children.set(name, child);
	}
	return root;
}

Entry.root = generateEntry(JSON.parse(readFile('./conf/entries.json').content));

Entry.find = path => Entry.root.find(path.dir.slice());

module.exports = Entry;
