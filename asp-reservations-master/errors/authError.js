const ApiError = require("./apiError");

class AuthError extends ApiError {
	StatusCode = 403;

	constructor(req) {
		super();
		this.req = req;
	}

	body() {
		return {
			ErrorType: `Auth error`,
			Message: `Invalid Authorization token`,
		};
	}
}

module.exports = AuthError;
