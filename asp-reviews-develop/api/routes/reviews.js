require("express-async-errors");
const router = require("express").Router({ mergeParams: true });
const ReviewService = require("../../services/reviewService");
const auth = require("../middleware/auth");

router.get("/", [auth], async (req, res) => {
	let reviews;
	const query = { organization: req.query.organization, bookId: req.query.bookId, own: req.query.own, page: req.query.page, limit: req.query.limit };
	reviews = await ReviewService.getAll(req.user, query);
	return res.json(reviews);
});

router.post("/", [auth], async (req, res) => {
	req.body.owner = req.user.email;
	const newReview = await ReviewService.create(req.user, req.body);
	return res.json(newReview);
});

router.delete("/:id", [auth], async (req, res) => {
	await ReviewService.delete(req.user, { id: req.params.id });
	return res.json({});
});

module.exports = router;
