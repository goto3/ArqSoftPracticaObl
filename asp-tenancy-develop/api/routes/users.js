const router = require("express").Router();
const UserService = require("../../services/userService");

router.post("/", async (req, res) => {
	const result = await UserService.signUpWithInvite(req.body, req.query.inviteId);
	return res.json(result);
});

module.exports = router;
