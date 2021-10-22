'use strict';

const fs = require('fs');
const getFileExtension = src => (src.match(/(?<=\.)([^.]+)$/) || [null])[0];

const type_map = JSON.parse(fs.readFileSync(
	'conf/typeMap.json',
	{ encoding: 'utf-8' }
));

function readFile(src, encoding = null)  {
	try {
		const extension = getFileExtension(src);
		const type = type_map?.[extension];
		if(!encoding)
			encoding = type && type.encoding;
		const options = {};
		if(encoding)
			options.encoding = encoding
		const content = fs.readFileSync(src, options);
		return { extension, type, encoding, content };
	} catch(e) {
		return null;
	}
};

module.exports = { readFile };
