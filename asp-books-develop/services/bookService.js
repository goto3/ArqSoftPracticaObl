const _ = require("lodash");
const moment = require("moment");
const { Op } = require("sequelize");

const { validateBook, createBook, BookDAO, validateExistsBookInOrg, validateExistsBookInOrgByIsbn, sanitizeIsbn, sanitizeId } = require("../models/book");
const { lastReservationEndDateForBook, availableCopies } = require("../models/reservation");

const NotFoundError = require("../errors/notFoundError");
const ValidationError = require("../errors/validationError");
const AuthError = require("../errors/authError");
const UnauthorizedError = require("../errors/unauthorizedError");

exports.create = async (data, user) => {
	let newBook = _.pick(data, ["isbn", "title", "organization", "authors", "year", "copiesAmount"]);
	newBook.isbn = sanitizeIsbn(newBook.isbn);
	await validateBook(newBook);
	validateUserOrg(user.organizations, data?.organization, "Administrator");
	await validateExistsBookInOrgByIsbn(newBook.isbn, newBook.organization, false);
	const book = await createBook(newBook);
	return _.pick(book, ["id", "isbn", "organization", "title", "authors", "year", "copiesAmount"]);
};

exports.get = async (id, user) => {
	if (isNaN(parseInt(id))) throw new NotFoundError("book", id);
	const book = await BookDAO.findByPk(parseInt(id));
	if (!book) throw new NotFoundError("book", id);
	if (!user.organizations.find((o) => o.OrganizationName.toLowerCase() == book.organization.toLowerCase())) throw new UnauthorizedError();
	const fields = ["id", "isbn", "organization", "title", "authors", "year", "copiesAmount"];
	return _.pick(book, fields);
};

exports.getAll = async (organization, page, limit, user, order = "", textSearch = "") => {
	if (!organization) throw new NotFoundError("organization", "not provided");
	validateUserOrg(user.organizations, organization);
	page = sanitizePage(page);
	limit = sanitizeLimit(limit);
	order = sanitizeOrder(order);
	textSearch = sanitizeTextSearch(textSearch);
	const max = await BookDAO.count({
		where: {
			organization: organization.toLowerCase(),
		},
	});
	const offset = max >= limit * (page - 1) ? limit * (page - 1) : 0;
	let where = generateTextSearchQuery(textSearch, organization);
	const books = await BookDAO.findAndCountAll({
		attributes: ["id"].concat(this.orderQueryables),
		where: where,
		order: order,
		limit: limit,
		offset: offset,
	});
	return {
		page,
		limit,
		...books,
	};
};

exports.put = async (id, data, user) => {
	await validateBook(data);
	const organization = data?.organization;
	if (!organization) throw new NotFoundError("organization", "not provided");
	validateUserOrg(user.organizations, organization, "Administrator");
	const book = await validateExistsBookInOrg(id, organization);
	if (!book) throw new NotFoundError("book", id);
	let updateBook = _.pick(data, ["isbn", "organization", "title", "authors", "year", "copiesAmount"]);

	if (updateBook.isbn) {
		updateBook.isbn = sanitizeIsbn(updateBook.isbn);
		if (updateBook.isbn != sanitizeIsbn(book.isbn)) {
			await validateExistsBookInOrgByIsbn(updateBook.isbn, organization, false);
		}
	}

	if (updateBook.copiesAmount) {
		if (isNaN(parseInt(updateBook.copiesAmount))) throw new ValidationError({ type: "Invalid Parameter", code: "INVALID_PARAMETER", message: `copiesAmount must be an integer` });
		updateBook.copiesAmount = parseInt(updateBook.copiesAmount);
		if (updateBook.copiesAmount < book.copiesAmount) {
			if (updateBook.copiesAmount <= 0) throw new ValidationError({ type: "Invalid Parameter", code: "INVALID_PARAMETER", message: `copiesAmount must be greater than 0` });
			const lastReservationDate = (await lastReservationEndDateForBook(book.id)) || moment().format("YYYY-MM-DD");
			const copies = await availableCopies(moment().format("YYYY-MM-DD"), lastReservationDate, book.id);
			const diff = book.copiesAmount - updateBook.copiesAmount;
			if (!isNaN(copies) && (copies <= 0 || diff > copies))
				throw new ValidationError({
					type: "Invalid Parameter",
					code: "INVALID_PARAMETER",
					message: `Some of the copies you're trying to erase are already reserved. You can erase up to ${copies} copies`,
				});
		}
	}

	await BookDAO.update(updateBook, {
		where: {
			id: id,
		},
	});

	return Object.assign(book, updateBook);
};

exports.delete = async (id, user) => {
	id = sanitizeId(id);
	const book = await BookDAO.findByPk(id);
	if (!book) throw new NotFoundError("book", id);
	validateUserOrg(user.organizations, book.organization, "Administrator");
	const lastReservationDate = (await lastReservationEndDateForBook(book.id)) || moment().format("YYYY-MM-DD");
	const copies = await availableCopies(moment().format("YYYY-MM-DD"), lastReservationDate, book.id);
	if (!isNaN(copies) && book.copiesAmount != copies) throw new ValidationError({ type: "Invalid Parameter", code: "INVALID_PARAMETER", message: `Unable to delete book with pending reservations` });
	await BookDAO.destroy({
		where: {
			id: id,
		},
	});
};

const sanitizePage = (page) => {
	page = parseInt(page);
	if (isNaN(page) || page <= 0) {
		return 1;
	}
	return page;
};

const sanitizeLimit = (limit) => {
	limit = parseInt(limit);
	if (isNaN(limit) || limit <= 0 || limit > 100) {
		return 100;
	}
	return limit;
};

const sanitizeOrder = (order) => {
	const result = [];
	if (typeof order === "string" || order instanceof String) {
		const orders = order.split(",");
		for (const o of orders) {
			if (o) {
				const keyOrder = o.split(".");
				if (keyOrder.length <= 2 && this.orderQueryables.includes(keyOrder[0].toLowerCase())) {
					if (keyOrder.length == 1) {
						keyOrder.push["ASC"];
					} else if (keyOrder[1].toUpperCase() == "DESC") {
						keyOrder[1] = "DESC";
					} else {
						keyOrder[1] = "ASC";
					}
					result.push(keyOrder);
				}
			}
		}
	}
	if (result.length == 0) result.push(["isbn", "ASC"]);
	return result;
};

exports.orderQueryables = ["isbn", "title", "authors", "year", "copiesAmount"];

const sanitizeTextSearch = (textSearch) => {
	if (!(typeof textSearch === "string" || textSearch instanceof String)) return "";
	textSearch = textSearch.replace("\\", "\\\\%");
	textSearch = textSearch.replace("%", "\\%");
	textSearch = textSearch.replace("_", "\\%");
	textSearch = "%" + textSearch + "%";
	return textSearch;
};

const generateTextSearchQuery = (textSearch, organization) => {
	if (textSearch != "") {
		return {
			[Op.and]: [
				{ organization: organization },
				{
					[Op.or]: [
						{
							isbn: { [Op.iLike]: textSearch },
						},
						{
							authors: { [Op.iLike]: textSearch },
						},
						{
							title: { [Op.iLike]: textSearch },
						},
					],
				},
			],
		};
	}
	return {
		organization: organization,
	};
};

function validateUserOrg(organizations, orgName, permission = "any") {
	const found = organizations.find((o) => o.OrganizationName === orgName.toLowerCase() && (permission === "any" || o.permission === permission));
	if (!found) throw new AuthError(`Insufficient permissions to perform this action on organization '${orgName}'.`);
}
