require("express-async-errors");
const router = require("express").Router();
const InviteService = require("../../services/inviteService");
const auth = require("../middleware/auth");

router.post("/", [auth], async (req, res) => {
	const invite = await InviteService.create(req.body, req.user);
	return res.json(invite);
});

router.get("/:id", async (req, res) => {
	const invite = await InviteService.get(req.params.id);
	return res.json(invite);
});

router.delete("/:id", [auth], async (req, res) => {
	const token = await InviteService.delete(req.params.id, req.user);
	return res.json({ token });
});

module.exports = router;
