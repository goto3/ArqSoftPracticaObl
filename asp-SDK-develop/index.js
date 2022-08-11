const Joi = require("joi").extend(require("@joi/date"));
const axios = require("axios").default;
const moment = require("moment");

const http = axios.create({
	timeout: 500,
});

/**
 * Fetches all reservations for a specific book withing a date range.
 *
 * @param {string} apiUrl - URL to the query endpoint. Example: http://localhost:4304/api/reservations
 * @param {string} apiKey - Api key provided. Used to authorize the library HTTP request. Sould comply with guid format. Example: 'afa71445-0be0-4fc6-af18-b331f6971904'.
 * @param {number} bookId - Book id to fetch reservations. Must be a number greater than 0.
 * @param {string} startDate - Start date to query. Should comply 'YYYY-MM-DD' format.
 * @param {string} endDate - End date to query. Should comply 'YYYY-MM-DD' format.
 *
 * @returns {Promise<[]>} A list of reservations
 */
exports.fetch = async (apiUrl, apiKey, bookId, startDate, endDate) => {
	const { error } = Joi.object({
		apiUrl: Joi.string().uri().pattern(new RegExp(`^http://`)).required(),
		apiKey: Joi.string().guid().required(),
		bookId: Joi.number().min(0).strict().required(),
		startDate: Joi.date().format("YYYY-MM-DD").required(),
		endDate: Joi.date().format("YYYY-MM-DD").required(),
	}).validate({ apiUrl, apiKey, bookId, startDate, endDate });
	if (error) throw error;

	if (moment(startDate, "YYYY-MM-DD").isAfter(moment(endDate, "YYYY-MM-DD"))) throw new AppError({ name: "Error", message: "Validation error: ", details: "'startDate should be before 'dateEnd'." });

	try {
		return (await http.get(apiUrl, { params: { bookId, startDate, endDate }, headers: { "x-api-key": apiKey } })).data;
	} catch (err) {
		if (err.message && err.message === "timeout of 500ms exceeded") throw new Error("Exceeded 500ms timeout.");
		if (err.message && err.message === "socket hang up") throw new Error("Could not connect to queries API, check 'apiUrl' parameter.");
		if (err.response && err.response.status == 400) throw new AppError({ name: "Error", message: "An error occurred validating the parameters: ", details: err.response.data });
		throw new AppError({ name: "Error", message: "An error occurred while processing the request: ", details: err });
	}
};

class AppError extends Error {
	constructor({ name, message, details }) {
		super(message);
		this.name = name;
		this.details = details;
	}
}
