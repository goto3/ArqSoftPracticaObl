module.exports = function () {
	const variables = ["PUBLIC_KEY", "PORT", "DB_CONNECTION", "AMQP_CONNECTION", "AMQP_BOOKS_EXCHANGE", "AMQP_RESERVATIONS_EXCHANGE"];

	variables.forEach((v) => {
		if (!process.env[v]) throw new Error(`missing ENV Variable '${v}'`);
	});
};
