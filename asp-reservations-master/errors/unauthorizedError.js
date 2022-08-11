const ApiError = require("./apiError");

class UnauthorizedError extends ApiError {
	StatusCode = 401;

	constructor(req) {
		super();
		this.req = req;
	}

	body() {
		return {
			ErrorType: `Unauthorized error`,
			Message: `You are not allowed to perform this operation.`,
		};
	}
}

module.exports = UnauthorizedError;
