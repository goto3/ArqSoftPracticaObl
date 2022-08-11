const Joi = require("joi");
const _db = require("../start/dbSequelize");
const emailQueue = require("../start/emailQueue");
const { generateAuthToken } = require("../models/user");
const { validateInvite, createInvite, findInvite, deleteInvite } = require("../models/invite");
const { joinOrganization, validateDuplicateUserOrg } = require("../models/userOrganization");

const ValidationError = require("../errors/validationError");
const DuplicateError = require("../errors/duplicateError");
const NotFoundError = require("../errors/notFoundError");
const AuthError = require("../errors/authError");

exports.create = async (data, user) => {
	await validateInvite(data);
	validateUserOrg(user.organizations, data.organization, "Administrator");

	let invite;
	const t = await _db.transaction();
	try {
		await validateDuplicateUserOrg(data.organization, data.email, t);
		invite = await createInvite(data, user.email, t);

		const email = { type: "INVITE", data: { to: invite.email, organization: invite.OrganizationName, hash: invite.hash } };
		await emailQueue.sendToQueue(email);

		await t.commit();
	} catch (err) {
		await t.rollback();
		if (err && err.errors && err.errors[0] && err.errors[0].type === "unique violation") throw new DuplicateError("invite", err.errors[0].value, "email");
		throw err;
	}
	return invite;
};

exports.get = async (id) => {
	const { error } = Joi.string().length(10).required().validate(id);
	if (error) throw new ValidationError({ type: "Bad Request", code: "invite.invalid", message: "Invite ID must be a 10 character long string." });

	const invite = await findInvite(id);
	if (!invite) throw new NotFoundError("invite", id);

	return invite;
};

exports.delete = async (id, user) => {
	const { error } = Joi.string().length(10).required().validate(id);
	if (error) throw new ValidationError({ type: "Bad Request", code: "invite.invalid", message: "Invite ID must be a 10 character long string." });

	let newToken;
	try {
		await _db.transaction(async (t) => {
			const invite = await findInvite(id, t);
			if (!invite) throw new NotFoundError("invite", id);
			await deleteInvite(id, t);

			validateNotBelongsOrganization(user.organizations, invite.OrganizationName);

			await joinOrganization(invite.OrganizationName, user, invite.permission, t);
			const newOrg = { OrganizationName: invite.OrganizationName, permission: invite.permission };
			user.organizations.push(newOrg);
			newToken = await generateAuthToken({ userName: user.userName, email: user.email }, user.organizations);
		});
	} catch (err) {
		if (err && err.errors && err.errors[0] && err.errors[0].type === "unique violation")
			throw new DuplicateError("User-Organization", `[${err.errors[0].value}-${err.errors[0].instance.OrganizationName}]`, "[UserEmail-OrganizationName]");
		throw err;
	}
	return newToken;
};

function validateUserOrg(organizations, orgName, permission) {
	const found = organizations.find((o) => o.OrganizationName.toLowerCase() === orgName.toLowerCase() && o.permission === permission);
	if (!found) throw new AuthError(`Insufficient permissions to perform this action on organization '${orgName}'.`);
}

function validateNotBelongsOrganization(organizations, orgName) {
	const found = organizations.find((o) => o.OrganizationName === orgName);
	if (found) throw new ValidationError({ type: "Validation Error", code: "Invite.AlreadyBelongs", message: `User already belongs to organization ${orgName}` });
}
