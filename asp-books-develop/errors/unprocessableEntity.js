const ApiError = require("./apiError");

class UnprocessableEntity extends ApiError {
	StatusCode = 422;

	constructor(resource, field) {
		super();
		this.resource = resource;
		this.field = field;
	}

	body() {
		return {
			type: `Unprocessable Entity`,
			code: `${this.resource}.unprocessableEntity`,
			Message: `The field ${this.field} from the ${this.resource} provided is unprocessable. Check if exists and it's type.`,
		};
	}
}

module.exports = UnprocessableEntity;
