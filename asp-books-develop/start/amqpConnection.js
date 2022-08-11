var amqp = require("amqplib");
const Joi = require("joi");

const amqpConnection = process.env.AMQP_CONNECTION || "";
const booksExchange = process.env.AMQP_BOOKS_EXCHANGE || "asp-books";
const reservationsExchange = process.env.AMQP_RESERVATIONS_EXCHANGE || "asp-reservations";

let _connection;
let channel;
let status = "Initializing";

exports.connect = async () => {
	try {
		_connection = await amqp.connect(amqpConnection);
		channel = await _connection.createChannel();
		channel.assertExchange(booksExchange, "fanout", { durable: true });
		channel.assertExchange(reservationsExchange, "fanout", { durable: true });

		_connection.on("close", () => {
			status = "Connection closed. Reconnecting...";
			console.error("AMQP connection closed. Reconnecting...: ");
			return setTimeout(this.connect, 1000);
		});

		console.info("Connected to amqp.");
		status = "Connected";
	} catch (error) {
		console.error("Error connecting to amqp. Retrying to connect...");
		status = "Connection error. Retrying...";
		setTimeout(this.connect, 1000);
	}
};

exports.disconnect = async () => await _connection.close();

exports.getStatus = () => status;

exports.publishBook = async (data) => {
	if (status !== "Connected") console.error("Cannot publish to queue while AMQP is not connected. Try again later.");

	const { error } = Joi.object({
		action: Joi.string().valid("CREATE", "UPDATE", "DELETE").required(),
		data: Joi.object().required(),
	}).validate(data);

	if (!error) channel.publish(booksExchange, "", Buffer.from(JSON.stringify(data)), { persistent: true });
	else console.error("Error publishing book to queue: ", error.details[0].message);
};

exports.publishReservation = async (data) => {
	if (status !== "Connected") console.error("Cannot publish to queue while AMQP is not connected. Try again later.");

	const { error } = Joi.object({
		action: Joi.string().valid("CREATE", "UPDATE").required(),
		data: Joi.object().required(),
	}).validate(data);

	if (!error) channel.publish(reservationsExchange, "", Buffer.from(JSON.stringify(data)), { persistent: true });
	else console.error("Error publishing reservation to queue: ", error.details[0].message);
};
