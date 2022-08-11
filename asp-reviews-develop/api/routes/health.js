const router = require("express").Router();
const cpuInfo = require("node-os-utils").cpu;
const memInfo = require("node-os-utils").mem;
const queue = require("../../start/amqpConnection");

router.get("/", async (req, res) => {
	const uptime = process.uptime();
	const serverDate = new Date();
	let postgreSQL_Status = "online";
	// postgreSQL
	try {
		const _db = require("../../start/dbSequelize");
		await _db.authenticate();
	} catch (err) {
		postgreSQL_Status = "offline";
	}
	const booksQueueStatus = queue.getStatus();
	const cpuUsage = (await cpuInfo.usage()) * 100;
	const ramInfo = await memInfo.free();
	res.send({ uptime, serverDate, postgreSQL_Status, booksQueueStatus, cpuUsage, ramInfo });
});

module.exports = router;
