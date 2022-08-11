const sequelize = require("./dbSequelize");
const queue = require("./emailQueue");
const { createHttpTerminator } = require("http-terminator");

let events = [
	{ name: "beforeExit", exitCode: 0 },
	{ name: "uncaughtExecption", exitCode: 1 },
	{ name: "SIGINT", exitCode: 130 },
	{ name: "SIGTERM", exitCode: 143 },
];

module.exports = (server) => {
	events.forEach((e) => {
		process.on(e.name, async () => {
			const disconnectDatabase = new Promise(async (resolve, reject) => {
				console.info("Closing DB connections...");
				await sequelize.close();
				resolve();
			});
			const disconnectExpress = new Promise(async (resolve, reject) => {
				console.info("Closing express server...");
				const httpTerminator = createHttpTerminator({ server });
				await httpTerminator.terminate();
				resolve();
			});
			const disconnectAmqp = new Promise(async (resolve, reject) => {
				console.info("Closing amqp connections...");
				await queue.disconnect();
				resolve();
			});

			Promise.all([disconnectDatabase, disconnectAmqp, disconnectExpress]).then((result) => {
				process.exit(e.exitCode);
			});
		});
	});
};
