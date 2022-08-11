var amqp = require("amqplib");
const emailService = require("../services/emailService");

const amqpConnection = process.env.AMQP_CONNECTION || "";
const amqpQueueName = process.env.AMQP_EMAIL_QUEUE_NAME || "email_queue";
const amqpPrefetchCount = process.env.AMQP_PREFETCH_COUNT || "100";

let _connection;

exports.connect = async () => {
	try {
		_connection = await amqp.connect(amqpConnection);
		const channel = await _connection.createChannel();
		channel.assertQueue(amqpQueueName, { durable: true });
		channel.prefetch(parseInt(amqpPrefetchCount));

		channel.consume(amqpQueueName, async (msg) => await consume(msg, channel));

		_connection.on("close", () => {
			console.error("AMQP connection closed. Reconnecting...: ");
			return setTimeout(this.connect, 1000);
		});

		console.info("Connected to AMQP. Listening for emails to send...");
	} catch (error) {
		console.error("Error connecting to amqp. Retrying to connect...", error);
		setTimeout(this.connect, 1000);
	}
};

exports.disconnect = async () => await _connection.close();

const consume = async (msg, channel) => {
	try {
		const email = JSON.parse(msg.content.toString());
		console.log("Recieved message: ", email);

		switch (email.type) {
			case "INVITE":
				await emailService.sendEmail(email.data);
				break;
			case "NOTIFICATION":
				await emailService.sendNotification(email.data);
				break;
			default:
				throw {};
		}

		channel.ack(msg);
	} catch (err) {
		console.error("Error sending email. ", err);

		setTimeout(() => channel.reject(msg), 10000);
	}
};
