const _db = require("../start/dbSequelize");
const { DataTypes, Op } = require("sequelize");
const moment = require("moment");

const { UserNotificationDAO } = require("./userNotification");

const ReservationDAO = _db.define("Reservations", {
	startDate: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	organization: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	endDate: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	},
	bookIsbn: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	returned: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	notified: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
});

ReservationDAO.belongsTo(UserNotificationDAO, { foreignKey: "user" });

module.exports.createReservation = async (reservation) => {
	try {
		await UserNotificationDAO.create({ email: reservation.user });
	} catch {}
	return await ReservationDAO.create(reservation);
};

module.exports.editReservation = async (reservation) => {
	return await ReservationDAO.update(reservation, { where: { id: reservation.id } });
};

module.exports.setAsNotified = async (reservation) => {
	return await ReservationDAO.update({ notified: true }, { where: { id: reservation.id } });
};

module.exports.getUsersToNotify = async () => {
	return await ReservationDAO.findAll({
		include: [
			{
				model: UserNotificationDAO,
				attributes: [],
			},
		],
		where: {
			returned: false,
			notified: false,
			endDate: { [Op.lte]: moment().add(1, "days").format("YYYY-MM-DD") },
			"$UserNotification.notifications$": true,
		},
	});
};

module.exports.ReservationDAO = ReservationDAO;
