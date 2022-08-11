var amqp = require("amqplib");

const { createReservation, editReservation } = require("../models/reservation");

const amqpConnection = process.env.AMQP_CONNECTION || "";
const amqpReservationsQueueName = process.env.AMQP_RESERVATIONS_QUEUE_NAME || "reservations_q_notifications";
const amqpNotificationsQueueName = process.env.AMQP_NOTIFICATIONS_QUEUE_NAME || "email_queue";
const amqpExchangeName = process.env.AMQP_RESERVATIONS_EXCHANGE_NAME || "asp-reservations";
const amqpPrefetchCount = process.env.AMQP_PREFETCHCOUNT || "100";

let _connection;
let channel;
let status = "Initializing";

exports.connect = async () => {
	try {
		_connection = await amqp.connect(amqpConnection);
		channel = await _connection.createChannel();

		// Reservations queue
		channel.assertQueue(amqpReservationsQueueName, { durable: true });
		channel.bindQueue(amqpReservationsQueueName, amqpExchangeName, "");
		channel.prefetch(parseInt(amqpPrefetchCount));
		channel.consume(amqpReservationsQueueName, async (msg) => await consume(msg, channel));

		//NotificationsQueue
		channel.assertQueue(amqpNotificationsQueueName, { durable: true });

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
				await createReservation(data);
				break;
			case "UPDATE":
				await editReservation(data);
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

exports.publishNotification = async (data) => {
	if (status !== "Connected") console.error("Cannot publish to queue while AMQP is not connected. Try again later.");

	const message = { type: "NOTIFICATION", data };

	channel.sendToQueue(amqpNotificationsQueueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};
