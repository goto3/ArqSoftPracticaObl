const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const _db = require("../start/dbSequelize");

const JoiValidationError = require("../errors/joiValidationError");
const ValidationError = require("../errors/validationError");

const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----\n${process.env.PRIVATE_KEY}\n-----END RSA PRIVATE KEY-----`;

const UserDAO = _db.define(
	"User",
	{
		userName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		indexes: [
			{
				unique: true,
				fields: ["email"],
			},
		],
	}
);

module.exports.generateAuthToken = async (user, orgs) => {
	orgs = orgs.map(({ OrganizationName, permission }) => ({ OrganizationName, permission }));
	return jwt.sign({ name: user.userName, email: user.email, organizations: orgs }, PRIVATE_KEY, { algorithm: "RS256", expiresIn: "30d" });
};

module.exports.validateUser = async (user) => {
	if (!user) throw new ValidationError({ type: "Validation Error", message: `Missing 'user' key with its credentials (name, email and password).` });
	const { error } = Joi.object({
		userName: Joi.string().min(5).max(50).required(),
		email: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required(),
	}).validate(user);
	if (error) throw new JoiValidationError(error);
};

module.exports.validateCredentials = async (credentials) => {
	const { error } = Joi.object({
		email: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required(),
	}).validate(credentials);
	if (error) throw new JoiValidationError(error);
};

module.exports.createUser = async (user, transaction) => {
	const salt = await bcrypt.genSalt(8);
	const password = await bcrypt.hash(user.password, salt);
	const userData = {
		userName: user.userName,
		email: user.email.toLowerCase(),
		password,
		Organizations: [{ name: user.organization.toLowerCase(), User_Organizations: { permission: user.permission } }],
	};
	return await UserDAO.create(userData, { transaction });
};

module.exports.UserDAO = UserDAO;
