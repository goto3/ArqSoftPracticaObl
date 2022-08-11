const Joi = require("joi");
const _db = require("../start/dbSequelize");
const { QueryTypes, DataTypes, Op } = require("sequelize");
const sequelize = require("../start/dbSequelize");
const JoiValidationError = require("../errors/joiValidationError");
const ValidationError = require("../errors/validationError");
const { BookDAO } = require("./book");
const moment = require("moment");

const ReservationDAO = _db.define(
	"Reservations",
	{
		startDate: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		endDate: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		user: {
			type: DataTypes.STRING,
			allowNull: false
		},
		book: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		returned : {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	},
	{
		paranoid: true,
		indexes: [{
			using: "BTREE",
			fields: [
				"startDate"
			]
		},
		{
			using: "BTREE",
			fields: [
				"endDate"
			]
		},
		{
			using: "BTREE",
			fields: [
				"user"
			]
		},
		{
			using: "BTREE",
			fields: [
				"book"
			]
		}]
	}
);
ReservationDAO.belongsTo(BookDAO, { foreignKey: "book" });

module.exports.validateReservation = async (reservation) => {
	const { error } = Joi.object({
		book: Joi.number().integer().required(),
		user: Joi.string().required(),
		startDate: Joi.date().required(),
		endDate: Joi.date().required()
	}).validate(reservation);
	if (error) throw new JoiValidationError(error);
};

module.exports.createReservation = async (reservation) => {
	this.validateReservation(reservation);
	return await ReservationDAO.create(reservation);
};

module.exports.sanitizeReservationDate = (date) => {
	const newDate = moment(date).format("YYYY-MM-DD");
	if (newDate == "Invalid date") throw new ValidationError({ type: "Invalid Date", code: "INVALID_DATE", message: `The date format of ${date} is not valid` });
	return newDate;
};

module.exports.availableCopies = async (startDate, endDate, book) => {
	startDate = this.sanitizeReservationDate(startDate);
	endDate = this.sanitizeReservationDate(endDate);
	const availableCopies = await sequelize.query(
		`SELECT ((SELECT b."copiesAmount" FROM "Books" b WHERE b.id = :book) - max(t.count)) as count ` +
		`FROM (SELECT t.day, count(*) as count FROM "Reservations" r, ` +
		`(SELECT t.day::date FROM generate_series(timestamp :startDate, timestamp :endDate, interval  '1 day') AS t(day)) t ` +
		`WHERE t.day BETWEEN r."startDate" AND r."endDate" AND r."book"= :book GROUP BY t.day ORDER BY t.day asc) t`,
		{
			replacements: {
				"book": book,
				"startDate": startDate,
				"endDate": endDate
			},
			type: QueryTypes.SELECT
		});
	return parseInt(availableCopies[0].count);
};

module.exports.lastReservationEndDateForBook = async (book) => {
	const result = await ReservationDAO.findAll({
		attributes: [
			[sequelize.fn("MAX", sequelize.col("endDate")), "endDate"]
		],
		where: {
			book: book
		}
	});
	return result[0].endDate;
};

module.exports.status = {
	PENDING: "pending",
	STARTED: "started",
	FINISHED: "finished",
	MISSING: "missing"
};

module.exports.ReservationDAO = ReservationDAO;