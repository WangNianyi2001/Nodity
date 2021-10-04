'use strict';

const fs = require('fs');
const getFileExtension = src => (src.match(/(?<=\.)([^.]+)$/) || [null])[0];

const type_map = JSON.parse(fs.readFileSync(
	'conf/typeMap.json',
	{ encoding: 'utf-8' }
));

module.exports = (src, encoding = null) => {
	try {
		const extension = getFileExtension(src);
		const type = (extension && type_map[extension]) || null;
		encoding = encoding || type && type.encoding || null;
		const content = fs.readFileSync.apply(fs, [src, encoding ? { encoding } : {}]);
		return { extension, type, encoding, content };
	} catch(e) {
		return null;
	}
};
