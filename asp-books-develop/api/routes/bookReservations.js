require("express-async-errors");
const router = require("express").Router({ mergeParams: true });

const error = require("../middleware/error");
const auth = require("../middleware/auth");
const ReservationService = require("../../services/reservationService");
const queue = require("../../start/amqpConnection");

router.post("/", [auth], async (req, res) => {
	const newReservation = await ReservationService.create(req.user, req.params.bookId, req.body);
	queue.publishReservation({ action: "CREATE", data: newReservation });
	return res.json(newReservation);
});

router.use(error); //Requerido por el nesting de routers
module.exports = router;
