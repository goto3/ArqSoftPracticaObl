require("newrelic");
require("./start/envCheck")();

const port = process.env.PORT;

(async () => {
	const api = require("express")();

	await require("./start/emailQueue").connect();

	require("./start/cors")(api);
	require("./api/routes")(api);

	const server = api.listen(port, () => console.info(`Express: Listening on port ${port}...`));
	require("./start/process")(server);
})();
