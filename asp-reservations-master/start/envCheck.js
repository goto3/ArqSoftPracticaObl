module.exports = function () {
	const variables = ["PORT", "DBHOST", "DBNAME", "DBUSER", "DBPASSWORD"];

	variables.forEach((v) => {
		if (!process.env[v]) throw new Error(`missing ENV Variable '${v}'`);
	});
};
