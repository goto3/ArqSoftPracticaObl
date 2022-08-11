const express = require("express");
const Auth = require("./routes/auth");
const Invites = require("./routes/invites");
const Organizations = require("./routes/organizations");
const Users = require("./routes/users");
const HealthCheck = require("./routes/healthCheck");
const error = require("./middleware/error");
const internal = require("./routes/internal");

module.exports = function (app) {
	app.use(express.json()); // Must be first line

	app.use("/api/auth", Auth);
	app.use("/api/invites", Invites);
	app.use("/api/organizations", Organizations);
	app.use("/api/users", Users);
	app.use("/api/healthcheck", HealthCheck);
	app.use("/api/internal", internal);

	app.use(error); // Must be the last line
};
