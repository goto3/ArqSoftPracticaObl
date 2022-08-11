const ApiError = require("./apiError");

class ValidationError extends ApiError {
	StatusCode = 400;

	constructor(error) {
		super();
		this.error = error;
	}

	body() {
		return {
			type: this.error.type,
			code: this.error.code,
			message: this.error.message,
		};
	}
}

module.exports = ValidationError;
