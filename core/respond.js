'use strict';

module.exports = cb => (req, res) => {
	try {
		const status = cb(req, res);
		if(status && status !== 200)
			res.writeHead(status);
	} catch(e) {
		console.error(e);
		res.writeHead(500);
		res.write(e.toString());
	} finally {
		res.end();
	}
};
