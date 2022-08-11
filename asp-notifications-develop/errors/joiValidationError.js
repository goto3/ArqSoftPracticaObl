const ApiError = require("./apiError");

class JoiValidationError extends ApiError {
	StatusCode = 400;

	constructor(error) {
		super();
		this.error = error;
	}

	body() {
		return {
			type: "Field Validation",
			code: `${this.error.details[0].path[0]}.${this.error.details[0].type}`,
			message: this.error.details[0].message,
		};
	}
}

module.exports = JoiValidationError;
