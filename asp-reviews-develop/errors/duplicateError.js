const ApiError = require("./apiError");

class DuplicateError extends ApiError {
	StatusCode = 400;

	constructor(resource, id, key = "key") {
		super();
		this.resource = resource;
		this.id = id;
		this.key = key;
	}

	body() {
		return {
			type: `Duplicate error`,
			code: `${this.resource}.duplicate`,
			Message: `Already exists a ${this.resource} with ${this.key} '${this.id}'.`,
		};
	}
}

module.exports = DuplicateError;
