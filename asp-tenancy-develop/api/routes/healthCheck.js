const router = require("express").Router();
const queue = require("../../start/emailQueue");
const cpuInfo = require("node-os-utils").cpu;
const memInfo = require("node-os-utils").mem;

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
	const emailQueueStatus = queue.getStatus();
	const cpuUsage = (await cpuInfo.usage()) * 100;
	const ramInfo = await memInfo.free();
	res.send({ uptime, serverDate, postgreSQL_Status, emailQueueStatus, cpuUsage, ramInfo });
});

module.exports = router;
