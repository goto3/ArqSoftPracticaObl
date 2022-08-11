const Joi = require("joi");
const config = require("config");
const { DataTypes } = require("sequelize");
const _db = require("../start/dbSequelize");
const { UserDAO } = require("./user");
const { OrganizationDAO } = require("./organization");

const JoiValidationError = require("../errors/joiValidationError");

const permissions = config.get("permissions");

const InviteDAO = _db.define(
	"Invite",
	{
		hash: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		permission: {
			type: DataTypes.ENUM(permissions),
			allowNull: false,
		},
	},
	{
		uniqueKeys: {
			Items_unique: {
				fields: ["email", "OrganizationName"],
			},
		},
		indexes: [
			{
				unique: true,
				fields: ["hash"],
			},
			{
				unique: true,
				fields: ["email", "OrganizationName"],
			},
		],
	}
);

InviteDAO.belongsTo(UserDAO, {
	as: "owner",
	onDelete: "CASCADE",
	foreignKey: {
		allowNull: false,
	},
});
InviteDAO.belongsTo(OrganizationDAO, {
	onDelete: "CASCADE",
	foreignKey: {
		allowNull: false,
	},
});

module.exports.validateInvite = async (data) => {
	const { error } = Joi.object({
		organization: Joi.string().min(5).max(50).required(),
		email: Joi.string().min(5).max(255).required().email(),
		permission: Joi.string()
			.valid(...permissions)
			.required(),
	}).validate(data);
	if (error) throw new JoiValidationError(error);
};

module.exports.createInvite = async (data, userId, transaction) => {
	const hash = require("crypto").randomBytes(5).toString("hex");
	return InviteDAO.create({ ownerEmail: userId, OrganizationName: data.organization.toLowerCase(), email: data.email.toLowerCase(), permission: data.permission, hash: hash }, { transaction });
};

module.exports.findInvite = async (id, transaction) => {
	return await InviteDAO.findOne({
		where: {
			hash: id,
		},
		attributes: ["hash", "email", "permission", "ownerEmail", "OrganizationName"],
		transaction,
	});
};

module.exports.deleteInvite = async (id, transaction) => {
	return await InviteDAO.destroy({
		where: {
			hash: id,
		},
		transaction,
	});
};

module.exports.InviteDAO = InviteDAO;
