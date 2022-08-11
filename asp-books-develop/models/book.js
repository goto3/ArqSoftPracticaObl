const Joi = require("joi");
const DataTypes = require("sequelize");
const _db = require("../start/dbSequelize");
const DuplicateError = require("../errors/duplicateError");
const JoiValidationError = require("../errors/joiValidationError");
const ValidationError = require("../errors/validationError");
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
				type: "UNIQUE",
				fields: ["isbn", "organization"],
				where: {
					deletedAt: {
						[Op.is]: null,
					},
				},
			},
			{
				type: "BTREE",
				fields: ["organization"],
			},
			{
				fields: ["authors", "title"],
				using: "gist",
			},
		],
		paranoid: true,
	}
);

module.exports.validateBook = async (book) => {
	const { error } = Joi.object({
		isbn: Joi.string().regex(/^\d+$/).length(13).required(),
		organization: Joi.string().required(),
		title: Joi.string().required(),
		authors: Joi.string(),
		year: Joi.number().integer().greater(-4000).less(10000),
		copiesAmount: Joi.number().integer().greater(-1).required(),
	}).validate(book);
	if (error) throw new JoiValidationError(error);
};

module.exports.validateExistsBookInOrg = async (id, org, mustExist = true) => {
	id = this.sanitizeId(id);
	const { error } = Joi.object({
		id: Joi.number().strict().min(0).required(),
		org: Joi.string().required(),
	}).validate({ id, org });
	if (error) throw new JoiValidationError(error);
	let book = await BookDAO.findByPk(id);
	book = book && book.organization.toLowerCase() == org.toLowerCase() ? book : null;
	if (!book && mustExist) throw new NotFoundError("book", id);
	if (book && !mustExist) throw new DuplicateError("book", id);
	return book;
};

module.exports.validateExistsBookInOrgByIsbn = async (isbn, org, mustExist = true) => {
	const book = await BookDAO.findOne({
		where: {
			isbn: this.sanitizeIsbn(isbn),
			organization: org,
		},
	});
	if (!book && mustExist) throw new NotFoundError("book", isbn);
	if (book && !mustExist) throw new DuplicateError("book", isbn);
	return book;
};

module.exports.createBook = async (book) => {
	try {
		const newBook = await BookDAO.create({
			...book,
		});
		return newBook;
	} catch (error) {
		if (error.name == "SequelizeUniqueConstraintError") {
			throw new DuplicateError("book", book.isbn, "isbn");
		}
	}
};

module.exports.sanitizeIsbn = (isbn) => {
	return isbn.replace(/-/g, "");
};

module.exports.sanitizeId = (id) => {
	const idNumber = parseInt(id);
	if (!idNumber) throw new ValidationError({ type: "Validation Error", code: "ERR_EDITBOOK_ID_NOTANUMBER", message: "id parameter must be a valid number" });
	return idNumber;
};

module.exports.BookDAO = BookDAO;
