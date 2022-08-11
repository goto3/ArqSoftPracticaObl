const express = require("express");
const Health = require("./routes/health");
const Reviews = require("./routes/reviews");
const error = require("./middleware/error");

module.exports = function (app) {
	app.use(express.json()); // Must be first line

	app.use("/api/reviews", Reviews);
	app.use("/api/healthcheck", Health);

	app.use(error); // Must be the last line
};
