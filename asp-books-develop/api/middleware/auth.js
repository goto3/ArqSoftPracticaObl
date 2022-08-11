const jwt = require("jsonwebtoken");

const AuthError = require("../../errors/authError");

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----\n${process.env.PUBLIC_KEY}\n-----END PUBLIC KEY-----`;

module.exports = function (req, res, next) {
	try {
		if (!req.header("Authorization")) throw { name: "TokenMissing" };
		const token = req.header("Authorization");

		const tokenArray = token.split(" ");
		if (tokenArray.length != 2) throw { name: "TokenFormat" };

		const payload = jwt.verify(tokenArray[1], PUBLIC_KEY, { algorithms: ["RS256"] });

		req.user = payload;
		next();
	} catch (ex) {
		if (ex.name && ex.name === "TokenMissing") throw new AuthError("Must provide a valid Bearer JWT with Authorization header.");
		if (ex.name && ex.name === "TokenFormat") throw new AuthError("Must provide a valid Bearer JWT.");
		if (ex.name && ex.name === "TokenExpiredError") throw new AuthError("JWT token expired.");
		throw new AuthError();
	}
};
