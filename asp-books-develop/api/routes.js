const express = require("express");
const Health = require("./routes/health");
const error = require("./middleware/error");
const Books = require("./routes/books");
const Reservations = require("./routes/reservations");

module.exports = function (app) {
	app.use(express.json()); // Must be first line

	app.use("/api/healthcheck", Health);
	app.use("/api/books", Books);
	app.use("/api/reservations", Reservations);

	app.use(error); // Must be the last line
};
