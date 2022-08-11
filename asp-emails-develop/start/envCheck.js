module.exports = function () {
	const variables = ["FRONTENDHOST", "EMAILDOMAIN", "MAILGUN_API_KEY", "AMQP_CONNECTION", "AMQP_EMAIL_QUEUE_NAME", "AMQP_PREFETCH_COUNT"];

	variables.forEach((v) => {
		if (!process.env[v]) throw new Error(`Missing ENV Variable '${v}'`);
	});
};
