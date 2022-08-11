const Joi = require("joi");
const DataTypes = require("sequelize");
const _db = require("../start/dbSequelize");

const JoiValidationError = require("../errors/joiValidationError");

const UserNotificationDAO = _db.define(
	"UserNotifications",
	{
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		notifications: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		indexes: [
			{
				type: "UNIQUE",
				fields: ["email"],
			},
		],
	}
);

module.exports.validateUN = async (un) => {
	const { error } = Joi.object({
		email: Joi.string().min(5).max(255).required().email(),
		notifications: Joi.bool().required(),
	}).validate(un);
	if (error) throw new JoiValidationError(error);
};

module.exports.createUN = async (un) => {
	return await UserNotificationDAO.create(un);
};

module.exports.getUN = async (email) => {
	return await UserNotificationDAO.findByPk(email);
};

module.exports.toggleUN = async (email) => {
	const un = await UserNotificationDAO.findByPk(email);

	un.notifications = !un.notifications;
	return await un.save();
};

module.exports.UserNotificationDAO = UserNotificationDAO;
