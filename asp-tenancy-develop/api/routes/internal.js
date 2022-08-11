const router = require("express").Router();
const OrganizationService = require("../../services/organizationService");
const InternalAuth = require("../middleware/internalAuth");

router.get("/apiKeys", [InternalAuth], async (req, res) => {
	const result = await OrganizationService.getAllApiKeys();
	return res.json(result);
});

module.exports = router;
