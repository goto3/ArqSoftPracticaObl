const router = require("express").Router();
const cpuInfo = require("node-os-utils").cpu;
const memInfo = require("node-os-utils").mem;

router.get("/", async (req, res) => {
	const uptime = process.uptime();
	const serverDate = new Date();
	let dbStatus = "online";

	// postgreSQL
	try {
		const _db = require("../../start/dbSequelize");
		await _db.authenticate();
	} catch (err) {
		dbStatus = "offline";
	}
	const cpuUsage = (await cpuInfo.usage()) * 100;
	const ramInfo = await memInfo.free();
	res.send({ uptime, serverDate, dbStatus, cpuUsage, ramInfo });
});

module.exports = router;
