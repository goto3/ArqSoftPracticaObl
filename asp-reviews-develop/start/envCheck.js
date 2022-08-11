module.exports = function () {
	const variables = ["PUBLIC_KEY", "PORT", "DB_CONNECTION", "AMQP_CONNECTION", "AMQP_BOOKS_QUEUE_NAME", "AMQP_BOOKS_EXCHANGE_NAME", "AMQP_PREFETCH_COUNT"];

	variables.forEach((v) => {
		if (!process.env[v]) throw new Error(`missing ENV Variable '${v}'`);
	});
};
