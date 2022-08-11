const jwt = require("jsonwebtoken");

const AuthError = require("../../errors/authError");

const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----\n${process.env.PRIVATE_KEY}\n-----END RSA PRIVATE KEY-----`;

module.exports = function (req, res, next) {
	try {
		if (!req.header("Authorization")) throw { name: "TokenMissing" };
		const token = req.header("Authorization");

		const tokenArray = token.split(" ");
		if (tokenArray.length != 2) throw { name: "TokenFormat" };

		const payload = jwt.verify(tokenArray[1], PRIVATE_KEY, { algorithms: ["RS256"] });

		req.user = payload;
		next();
	} catch (ex) {
		if (ex.name && ex.name === "TokenMissing") throw new AuthError("Must provide a valid Bearer JWT in Authorization header.");
		if (ex.name && ex.name === "TokenFormat") throw new AuthError("Must provide a valid Bearer JWT.");
		if (ex.name && ex.name === "TokenExpiredError") throw new AuthError("JWT token expired.");
		throw new AuthError();
	}
};
