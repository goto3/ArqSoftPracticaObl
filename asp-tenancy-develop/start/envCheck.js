module.exports = function () {
	const variables = ["PRIVATE_KEY", "PORT", "DB_CONNECTION", "INTERNALKEY", "AMQP_CONNECTION", "AMQP_EMAIL_QUEUE_NAME"];

	variables.forEach((v) => {
		if (!process.env[v]) throw new Error(`missing ENV Variable '${v}'`);
	});
};
