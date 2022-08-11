const express = require("express");
const error = require("./middleware/error");
const Health = require("./routes/health");

module.exports = function (app) {
	app.use(express.json()); // Must be first line

	app.use("/api/healthcheck", Health);

	app.use(error); // Must be the last line
};
