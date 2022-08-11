const _db = require("../start/dbSequelize");

const { deleteInvite, findInvite } = require("../models/invite");
const { validateUser, generateAuthToken, createUser } = require("../models/user");
const { joinOrganization } = require("../models/userOrganization");

const NotFoundError = require("../errors/notFoundError");
const DuplicateError = require("../errors/duplicateError");

exports.signUpWithInvite = async (data, inviteId) => {
	await validateUser(data);

	let newUser, token;
	try {
		await _db.transaction(async (t) => {
			const invite = await findInvite(inviteId, t);
			if (!invite) throw new NotFoundError("invite", inviteId);
			await deleteInvite(inviteId, t);

			data.email = invite.email;
			data.organization = invite.OrganizationName;
			data.permission = invite.permission;

			newUser = await createUser(data, t);
			await joinOrganization(invite.OrganizationName, data, invite.permission, t);

			const org = { OrganizationName: invite.OrganizationName, permission: invite.permission };
			token = await generateAuthToken(newUser, [org]);
		});
	} catch (err) {
		if (err && err.errors && err.errors[0] && err.errors[0].type === "unique violation") throw new DuplicateError("user", err.errors[0].value, "email");
		throw err;
	}
	return { newUser, token };
};
