require("express-async-errors");
const router = require("express").Router();
const auth = require("../middleware/auth");

const OrganizationService = require("../../services/organizationService");
const apiKeyService = require("../../services/apiKeyService");

router.get("/", [auth], async (req, res) => {
	const newOrg = await OrganizationService.getAllFromUserWithApiKeys(req.user);
	return res.json(newOrg);
});

router.post("/", async (req, res) => {
	const newOrg = await OrganizationService.create(req.body);
	return res.json(newOrg);
});

router.get("/:organization/apiKey", [auth], async (req, res) => {
	const key = await apiKeyService.get(req.user, req.params.organization);
	res.send({ token: key });
});

router.put("/:organization/apikey", [auth], async (req, res) => {
	const newKey = await apiKeyService.renew(req.user, req.params.organization);
	res.send({ newKey });
});

module.exports = router;
