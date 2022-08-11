const sequelize = require("./dbSequelize");
const { createHttpTerminator } = require("http-terminator");

let events = [
	{ name: "beforeExit", exitCode: 0 },
	{ name: "uncaughtExecption", exitCode: 1 },
	{ name: "SIGINT", exitCode: 130 },
	{ name: "SIGTERM", exitCode: 143 },
];

module.exports = (server) => {
	events.forEach((e) => {
		process.on(e.name, () => {
			console.info("Closing server and DB connections...");
			sequelize.close().finally(() => {
				const httpTerminator = createHttpTerminator({ server });
				httpTerminator.terminate();

				process.exit(e.exitCode);
			});
		});
	});
};
