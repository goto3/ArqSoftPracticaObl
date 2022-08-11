const config = require("config");
const Joi = require("joi");
const { DataTypes } = require("sequelize");
const _db = require("../start/dbSequelize");

const JoiValidationError = require("../errors/joiValidationError");
const DuplicateError = require("../errors/duplicateError");
const NotFoundError = require("../errors/notFoundError");

const ratings = config.get("ratings");

const ReviewDAO = _db.define(
	"Review",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		owner: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: "compositeKey",
		},
		organization: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: "compositeKey",
		},
		bookId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: "compositeKey",
		},
		rating: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		review: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		indexes: [
			{
				unique: true,
				fields: ["id"],
			},
			{
				unique: true,
				fields: ["owner", "organization", "bookId"],
			},
		],
	}
);

module.exports.createReview = async (review) => {
	return await ReviewDAO.create(review);
};

module.exports.validateReview = async (review) => {
	const { error } = Joi.object({
		owner: Joi.string().min(5).max(255).required().email(),
		organization: Joi.string().min(5).max(50).required(),
		bookId: Joi.number().strict().required(),
		rating: Joi.number()
			.strict()
			.valid(...ratings)
			.required(),
		review: Joi.string().min(1).max(500).required(),
	}).validate(review);
	if (error) throw new JoiValidationError(error);
};

module.exports.validateReviewDelete = async (review) => {
	const { error } = Joi.object({
		id: Joi.number().min(0).required(),
	}).validate(review);
	if (error) throw new JoiValidationError(error);
};

module.exports.validateExistsReview = async (id) => {
	const found = await ReviewDAO.findByPk(id);
	if (!found) throw new NotFoundError("review", `${id}`);
	return found;
};

module.exports.deleteReview = async (id) => {
	return await ReviewDAO.destroy({
		where: {
			id,
		},
	});
};

module.exports.ReviewDAO = ReviewDAO;
