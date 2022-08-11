const moment = require("moment");
const Joi = require("joi");
const { ReviewDAO, validateReview, createReview, validateReviewDelete, validateExistsReview, deleteReview } = require("../models/review");
const { validateExistsBookInOrg } = require("../models/book");

const AuthError = require("../errors/authError");
const DuplicateError = require("../errors/duplicateError");
const JoiValidationError = require("../errors/joiValidationError");
const ValidationError = require("../errors/validationError");

exports.create = async (user, review) => {
	await validateReview(review);
	validateUserOrg(user.organizations, review.organization, "Student");
	review.organization = review.organization.toLowerCase();

	let newReview;
	try {
		await validateExistsBookInOrg(review.bookId, review.organization, true);
		newReview = await createReview(review);
	} catch (err) {
		if (err && err.errors && err.errors[0] && err.errors[0].type === "unique violation")
			throw new DuplicateError("review", `[${user.email}:${review.organization}:${review.bookId}]`, `[UserEmail:OrganizationName:bookId]`);
		throw err;
	}
	return newReview;
};

exports.getAll = async (user, query) => {
	const { error } = Joi.object({
		organization: Joi.string().min(5).max(50).required(),
		bookId: Joi.number().required(),
		page: Joi.number().min(1).required(),
		limit: Joi.number().min(1).max(100).required(),
		own: Joi.string().required(),
	}).validate(query);
	if (error) throw new JoiValidationError(error);
	const lowerCase = JSON.parse(JSON.stringify(query).toLowerCase());
	const { organization, page, limit, own } = lowerCase;
	validateUserOrg(user.organizations, organization);

	if (own === "true") {
		const review = await ReviewDAO.findOne({
			where: {
				owner: user.email,
				organization,
				bookId: parseInt(query.bookId),
			},
		});
		return review;
	} else {
		const count = await ReviewDAO.count({
			where: {
				organization,
				bookId: parseInt(query.bookId),
			},
		});
		const offset = Math.min(limit * (page - 1), count);
		const reviews = await ReviewDAO.findAndCountAll({
			where: {
				organization,
				bookId: parseInt(query.bookId),
			},
			order: [["createdAt", "DESC"]],
			limit: limit,
			offset: offset,
		});
		return {
			page,
			limit,
			...reviews,
		};
	}
};

exports.delete = async (user, review) => {
	await validateReviewDelete(review);
	const existentReview = await validateExistsReview(review.id);
	review.organization = existentReview.organization;
	validateUserOrg(user.organizations, existentReview.organization, "Student");
	const timeFromCreated = moment().diff(moment(existentReview.createdAt), "hours");
	if (timeFromCreated >= 24) throw new ValidationError({ type: "Validation Error", code: "review.delete.tooOld", message: `Can not delete a review older than 24 hours.` });
	await deleteReview(review.id);
};

function validateUserOrg(organizations, orgName, permission = "any") {
	const found = organizations.find((o) => o.OrganizationName === orgName.toLowerCase() && (permission === "any" || o.permission === permission));
	if (!found) throw new AuthError(`Insufficient permissions to perform this action on organization '${orgName}'.`);
}
