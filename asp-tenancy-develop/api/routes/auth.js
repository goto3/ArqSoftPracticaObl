require("express-async-errors");
const router = require("express").Router();
const authService = require("../../services/authService");

router.post("/", async (req, res) => {
	const token = await authService.logIn(req.body);
	res.send({ token: token });
});

module.exports = router;
