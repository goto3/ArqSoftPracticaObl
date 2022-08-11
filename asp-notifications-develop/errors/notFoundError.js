const ApiError = require("./apiError");

class NotFoundError extends ApiError {
	StatusCode = 404;

	constructor(resource, id) {
		super();
		this.resource = resource;
		this.id = id;
	}

	body() {
		return {
			ErrorType: `Resource not found`,
			Message: `Could not find ${this.resource} with identifier '${this.id}'`,
		};
	}
}

module.exports = NotFoundError;
