const Joi = require("joi");
const DataTypes = require("sequelize");
const _db = require("../start/dbSequelize");
const DuplicateError = require("../errors/duplicateError");
const JoiValidationError = require("../errors/joiValidationError");
const NotFoundError = require("../errors/notFoundError");
const { Op } = require("sequelize");

const BookDAO = _db.define(
	"Books",
	{
		isbn: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		organization: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		authors: DataTypes.STRING,
		year: DataTypes.INTEGER,
		copiesAmount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		indexes: [
			{
				unique: true,
				fields: ["id"],
			},
		],
	}
);

module.exports.validateBook = async (book) => {
	const { error } = Joi.object({
		id: Joi.number().required(),
		isbn: Joi.string().regex(/^\d+$/).length(13).required(),
		organization: Joi.string().required(),
		title: Joi.string().required(),
		authors: Joi.string(),
		year: Joi.number().integer().greater(-4000).less(10000),
		copiesAmount: Joi.number().integer().greater(-1).required(),
	}).validate(book, { allowUnknown: true });
	if (error) throw new JoiValidationError(error);
};

module.exports.validateExistsBookInOrg = async (id, org, mustExist = true) => {
	let book = await BookDAO.findByPk(id);
	book = book && book.organization.toLowerCase() == org.toLowerCase() ? book : null;
	if (!book && mustExist) throw new NotFoundError("book", id);
	if (book && !mustExist) throw new DuplicateError("book", id);
	return book;
};

module.exports.createBook = async (book) => {
	await BookDAO.create({
		...book,
	});
};

module.exports.updateBook = async (book) => {
	await BookDAO.update(book, {
		where: {
			id: book.id,
		},
	});
};

module.exports.deleteBook = async (id) => {
	await BookDAO.destroy({
		where: {
			id: id,
		},
	});
};

module.exports.BookDAO = BookDAO;
