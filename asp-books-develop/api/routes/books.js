require("express-async-errors");
const BookService = require("../../services/bookService");
const auth = require("../middleware/auth");
const error = require("../middleware/error");

const bookReservations = require("./bookReservations");
const router = require("express").Router({ mergeParams: true });
router.use("/:bookId/reservations", bookReservations);

const booksQueue = require("../../start/amqpConnection");

router.post("/", [auth], async (req, res) => {
	const book = await BookService.create(req.body, req.user);
	booksQueue.publishBook({ action: "CREATE", data: book });
	return res.json(book);
});

router.get("/:id", [auth], async (req, res) => {
	const book = await BookService.get(req.params.id, req.user);
	return res.json(book);
});

router.get("/", [auth], async (req, res) => {
	const books = await BookService.getAll(req.query.organization, req.query.page, req.query.limit, req.user, req.query.order, req.query.textSearch);
	return res.json(books);
});

router.put("/:id", [auth], async (req, res) => {
	const book = await BookService.put(req.params.id, req.body, req.user);
	booksQueue.publishBook({ action: "UPDATE", data: book });
	return res.json(book);
});

router.delete("/:id", [auth], async (req, res) => {
	await BookService.delete(req.params.id, req.user);
	booksQueue.publishBook({ action: "DELETE", data: { id: req.params.id } });
	return res.json();
});

router.use(error); //Requerido por el nesting de routers
module.exports = router;
