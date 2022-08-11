const ApiError = require("./apiError");

class InvalidCredentialsError extends ApiError {
	StatusCode = 401;

	constructor(error) {
		super();
		this.error = error;
	}

	body() {
		return {
			ErrorType: "Invalid credentials",
			Message: "Invalid email or password.",
		};
	}
}

module.exports = InvalidCredentialsError;
