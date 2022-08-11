require("express-async-errors");
const router = require("express").Router();
const NotificationService = require("../../services/notificationService");
const auth = require("../middleware/auth");

router.get("/", [auth], async (req, res) => {
	const status = await NotificationService.getFromUser(req.user, req.query.organization);
	res.json(status);
});

router.patch("/", [auth], async (req, res) => {
	const status = await NotificationService.toggle(req.user, req.query.organization);
	res.json(status);
});

module.exports = router;
