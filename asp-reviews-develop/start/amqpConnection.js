var amqp = require("amqplib");

const { validateBook, createBook, updateBook, deleteBook } = require("../models/book");

const amqpConnection = process.env.AMQP_CONNECTION || "";
const amqpQueueName = process.env.AMQP_BOOKS_QUEUE_NAME || "books_q_reviews";
const amqpExchangeName = process.env.AMQP_BOOKS_EXCHANGE_NAME || "asp-books";
const amqpPrefetchCount = process.env.AMQP_PREFETCH_COUNT || "100";

let _connection;
let status = "Initializing";

exports.connect = async () => {
	try {
		_connection = await amqp.connect(amqpConnection);
		const channel = await _connection.createChannel();

		channel.assertQueue(amqpQueueName, { durable: true });
		channel.bindQueue(amqpQueueName, amqpExchangeName, "");
		channel.prefetch(parseInt(amqpPrefetchCount));

		channel.consume(amqpQueueName, async (msg) => await consume(msg, channel));

		_connection.on("close", () => {
			status = "Connection closed. Reconnecting...";
			console.error("AMQP connection closed. Reconnecting...: ");
			return setTimeout(this.connect, 1000);
		});

		status = "Connected";
		console.info("Connected to AMQP.");
	} catch (error) {
		console.error("Error connecting to amqp. Retrying to connect...", error);
		status = "Connection error. Retrying...";
		setTimeout(this.connect, 1000);
	}
};

exports.disconnect = async () => await _connection.close();

exports.getStatus = () => status;

const consume = async (msg, channel) => {
	try {
		const event = JSON.parse(msg.content.toString());
		const { action, data } = event;

		console.log("Received message: ", event);

		switch (action) {
			case "CREATE":
				await validateBook(data);
				await createBook(data);
				break;
			case "UPDATE":
				await validateBook(data);
				await updateBook(data);
				break;
			case "DELETE":
				await deleteBook(data.id);
				break;
			default:
				throw {};
		}

		channel.ack(msg);
	} catch (err) {
		console.error("Error processing event: ", err);
		setTimeout(() => channel.reject(msg), 10000);
	}
};
