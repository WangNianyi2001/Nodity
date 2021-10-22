'use strict';

module.exports = cb => async context => {
	const { res } = context;
	try {
		const status = await cb(context);
		if(status && status !== 200)
			res.writeHead(status);
	} catch(e) {
		console.error(e);	// Log file required
		res.writeHead(500);
		res.write(e.toString());
	} finally {
		res.end();
	}
};
