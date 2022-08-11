const ApiError = require("./apiError");

class AuthError extends ApiError {
	StatusCode = 403;

	constructor(message) {
		super();
		this.message = message;
	}

	body() {
		return {
			ErrorType: `Auth error`,
			Message: `Invalid Authorization token. ${this.message ?? ""}`,
		};
	}
}

module.exports = AuthError;
