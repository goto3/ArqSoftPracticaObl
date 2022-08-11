const express = require("express");
const Health = require("./routes/health");
const error = require("./middleware/error");
const Notifications = require("./routes/notifications");

module.exports = function (app) {
	app.use(express.json()); // Must be first line

	app.use("/api/healthcheck", Health);
	app.use("/api/notifications", Notifications);

	app.use(error); // Must be the last line
};
