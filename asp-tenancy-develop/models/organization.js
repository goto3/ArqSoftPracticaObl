const Joi = require("joi");
const { DataTypes } = require("sequelize");
const _db = require("../start/dbSequelize");
const { v4: uuidv4 } = require("uuid");

const JoiValidationError = require("../errors/joiValidationError");
const NotFoundError = require("../errors/notFoundError");

const OrganizationDAO = _db.define(
	"Organization",
	{
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		apiKey: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
	},
	{
		indexes: [
			{
				unique: true,
				fields: ["name"],
			},
			{
				unique: true,
				fields: ["apiKey"],
			},
		],
	}
);

module.exports.validateOrg = async (org) => {
	const { error } = Joi.object({
		name: Joi.string().min(5).max(50).required(),
	}).validate(org);
	if (error) throw new JoiValidationError(error);
};

module.exports.OrganizationDAO = OrganizationDAO;
