const ApiError = require("../../errors/apiError");

module.exports = function (err, req, res, next) {
	if (err instanceof ApiError) {
		return res.status(err.StatusCode).send(err.body());
	}
	console.error(err);
	return res.status(500).send({
		error_type: err.type,
		msg: err.msg,
		error: err,
	});
};
