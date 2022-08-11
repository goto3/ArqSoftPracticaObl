var amqp = require("amqplib");
const Joi = require("joi");

const ApiError = require("../errors/apiError");
const JoiValidationError = require("../errors/joiValidationError");

const amqpConnection = process.env.AMQP_CONNECTION || "";
const amqpQueueName = process.env.AMQP_EMAIL_QUEUE_NAME || "email_queue";

let _connection;
let channel;
let status = "Initializing";

exports.connect = async () => {
	try {
		_connection = await amqp.connect(amqpConnection);
		channel = await _connection.createChannel();
		channel.assertQueue(amqpQueueName, { durable: true });

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

exports.sendToQueue = async (message) => {
	if (status !== "Connected") throw new ApiError("Cannot send email while AMQP is not connected. Try again later.");

	const { error } = Joi.object({
		to: Joi.string().min(5).max(50).required().email(),
		organization: Joi.string().min(5).max(50).required(),
		hash: Joi.string().length(10).required(),
	}).validate(message.data);
	if (error) throw new JoiValidationError(error);

	channel.sendToQueue(amqpQueueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};
