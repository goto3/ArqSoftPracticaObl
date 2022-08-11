module.exports = function () {
	const variables = ["PORT", "TENANCY_API", "BOOKS_API", "REVIEWS_API", "NOTIFICATIONS_API", "QUERIES_API", "REDIS_HOST", "REDIS_PORT"];

	variables.forEach((v) => {
		if (!process.env[v]) throw new Error(`missing ENV Variable '${v}'`);
	});
};
