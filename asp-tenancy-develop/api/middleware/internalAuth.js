const AuthError = require("../../errors/authError");

const internalKey = process.env.INTERNALKEY;

module.exports = function (req, res, next) {
	try {
		if (!req.header("Authorization")) throw { name: "KeyMissing" };
		const key = req.header("Authorization");

		if (key !== internalKey) throw { name: "InvalidKey" };

		next();
	} catch (ex) {
		if (ex.name && ex.name === "TokenMisKeyMissingsing") throw new AuthError("Must provide a valid key in Authorization header.");
		if (ex.name && ex.name === "InvalidKey") throw new AuthError("Authorization key invalid.");
		throw new AuthError();
	}
};
