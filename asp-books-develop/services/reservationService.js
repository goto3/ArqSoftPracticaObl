const _ = require("lodash");
const { Op } = require("sequelize");
const moment = require("moment");
const ValidationError = require("../errors/validationError");
const DuplicateError = require("../errors/duplicateError");
const { ReservationDAO, createReservation, sanitizeReservationDate, availableCopies, status } = require("../models/reservation");
const { BookDAO } = require("../models/book");
const UnprocessableEntity = require("../errors/unprocessableEntity");
const NotFoundError = require("../errors/notFoundError");
const AuthError = require("../errors/authError");
const ApiError = require("../errors/apiError");

exports.create = async (user, bookId, data) => {
	const startDate = sanitizeReservationDate(data?.startDate);
	const book = await existsBook(bookId);
	validateUserOrg(user.organizations, book.organization, "Student");
	await validateUserIsNotPenalized(user.email, book.organization);
	if (moment().isAfter(startDate)) throw new ValidationError({ type: "Invalid Date", code: "INVALID_DATE", message: `The start date must be after today` });
	const endDate = moment(startDate).add(2, "days").format("YYYY-MM-DD");
	if (await this.hasReservationForDate(user.email, startDate, endDate, book.id)) throw new DuplicateError("reservation from user in specified range", `${startDate} to ${endDate}`, "range");
	if ((await availableCopies(startDate, endDate, book.id)) <= 0)
		throw new ValidationError({ type: "No copies available", code: "INVALID_PARAMETER", message: `There are no copies available for the selected range (from: ${startDate} to: ${endDate})` });
	const reservation = await createReservation({
		book: book.id,
		user: user.email,
		startDate,
		endDate,
	});
	reservation.organization = book.organization;
	reservation.bookId = book.id;
	reservation.bookIsbn = book.isbn;
	return _.pick(reservation, ["id", "organization", "bookId", "bookIsbn", "user", "startDate", "endDate"]);
};

exports.hasReservationForDate = async (user, start, end, book) => {
	const existingReservation = await ReservationDAO.findOne({
		where: {
			[Op.and]: [
				{ user },
				{ book },
				{
					[Op.or]: [{ startDate: { [Op.between]: [start, end] } }, { endDate: { [Op.between]: [start, end] } }],
				},
			],
		},
	});
	return existingReservation != null;
};

exports.getReservations = async (user, query) => {
	if (!query || !query.organization) throw new UnprocessableEntity("reservations", "organization");
	const organization = query.organization;
	const role = getUserPermissionsInOrg(user.organizations, organization);

	let filters = [];
	let where = {};
	if (role === "Student") where.user = user.email;
	where["$Book.organization$"] = query.organization;
	if (query.filter) filters = query.filter.toLowerCase().split(",");
	let reservations = await ReservationDAO.findAll({
		raw: true,
		nest: true,
		include: [
			{
				model: BookDAO,
				attributes: ["id", "isbn", "title"],
			},
		],
		where,
		order: [["endDate", "DESC"]],
		attributes: ["id", "startDate", "endDate", "returned"],
	});
	reservations.forEach((r) => (r.status = getReservationStatus(r)));
	reservations = reservations.filter((r) => filters.includes(r.status));
	return reservations;
};

exports.finishReservation = async (id, user) => {
	if (isNaN(parseInt(id))) throw new NotFoundError("reservation", id);
	const reservation = await ReservationDAO.findOne({
		include: [
			{
				model: BookDAO,
				attributes: ["organization"],
			},
		],
		where: {
			id: parseInt(id),
		},
	});
	if (!reservation) throw new NotFoundError("reservation", id);
	validateUserOrg(user.organizations, reservation.Book.organization, "Administrator");
	if (moment(reservation.startDate) > moment()) {
		throw new ValidationError({ type: "Validation error", code: "ERR_FINISHRESERVATION_STARTDATEAFTERNOW", message: `Reservation ${id} has not started yet` });
	}
	if (!reservation.returned) {
		reservation.returned = true;
		await reservation.save();
	}

	return reservation;
};

async function existsBook(book) {
	if (!book || isNaN(parseInt(book))) throw new UnprocessableEntity("reservation", "book");
	const record = await BookDAO.findByPk(book);
	if (!record) throw new NotFoundError("book", book);
	return record;
}
function validateUserOrg(organizations, orgName, permission) {
	const found = organizations.find((o) => o.OrganizationName === orgName.toLowerCase() && o.permission === permission);
	if (!found) throw new AuthError(`Insufficient permissions to perform this action on organization '${orgName}'.`);
}

function getUserPermissionsInOrg(organizations, organization) {
	const found = organizations.find((o) => o.OrganizationName.toLowerCase() === organization.toLowerCase());
	if (!found) throw new AuthError(`Insufficient permissions to perform this action on organization '${orgName}'.`);
	return found.permission;
}

function getReservationStatus(reservation) {
	if (moment(reservation.startDate) > moment()) {
		return status.PENDING;
	} else {
		if (reservation.returned) return status.FINISHED;
		if (moment(reservation.endDate) < moment()) return status.MISSING;
		return status.STARTED;
	}
}

async function validateUserIsNotPenalized(email, organization) {
	const missingReservations = await ReservationDAO.findAll({
		include: [
			{
				model: BookDAO,
				attributes: [],
			},
		],
		where: {
			returned: false,
			endDate: {
				[Op.lt]: moment().format("YYYY-MM-DD"),
			},
			user: email,
			"$Book.organization$": organization,
		},
	});
	if (missingReservations && missingReservations.length > 0) {
		if (missingReservations.length > 1) throw new ValidationError({ type: "User Penalized", code: "USER_PENALIZED_1", message: `The user hasn't returned 2 pending books` });
		if (moment().diff(moment(missingReservations[0].endDate), "days") >= 3)
			throw new ValidationError({ type: "User Penalized", code: "USER_PENALIZED_2", message: `The user hasn't returned a book 72 hours past its due date` });
	}
}

exports.resQueryables = ["startDate", "endDate"];
