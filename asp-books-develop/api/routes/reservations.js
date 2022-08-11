require("express-async-errors");
const ReservationService = require("../../services/reservationService");
const error = require("../middleware/error");
const auth = require("../middleware/auth");
const amqp = require("../../start/amqpConnection");

const router = require("express").Router({ mergeParams: true });

router.get("/", [auth], async (req, res) => {
	const reservations = await ReservationService.getReservations(req.user, req.query);
	res.json(reservations);
});

router.patch("/:id", [auth], async (req, res) => {
	const reservation = await ReservationService.finishReservation(req.params.id, req.user);
	await amqp.publishReservation({ action: "UPDATE", data: reservation });
	res.json();
});

router.use(error); //Requerido por el nesting de routers
module.exports = router;
