module.exports = function () {
	const variables = [
		"PUBLIC_KEY",
		"PORT",
		"DB_CONNECTION",
		"AMQP_CONNECTION",
		"AMQP_NOTIFICATIONS_QUEUE_NAME",
		"AMQP_RESERVATIONS_QUEUE_NAME",
		"AMQP_RESERVATIONS_EXCHANGE_NAME",
		"AMQP_PREFETCHCOUNT",
	];

	variables.forEach((v) => {
		if (!process.env[v]) throw new Error(`missing ENV Variable '${v}'`);
	});
};
