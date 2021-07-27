'use strict';

const fs = require('fs');
const getFileExtension = require('./getFileExtension');

const type_map = JSON.parse(fs.readFileSync(
	'conf/typeMap.json',
	{ encoding: 'utf-8' }
));

module.exports = (src, encoding = null) => {
	if(encoding === null)
		encoding = ((extension) =>
			(extension && type_map[extension])?.encoding || null
		)(getFileExtension(src));
	try {
		if(encoding)
			return fs.readFileSync(src, { encoding });
		else
			return fs.readFileSync(src);
	} catch(e) {
		return null;
	}
};
