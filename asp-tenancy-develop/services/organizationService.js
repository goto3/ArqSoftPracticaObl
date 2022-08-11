const _ = require("lodash");
const _db = require("../start/dbSequelize");
const { validateUser, generateAuthToken } = require("../models/user");
const { OrganizationDAO, validateOrg, renewApiKey } = require("../models/organization");
const { createUserOrg } = require("../models/userOrganization");

const DuplicateError = require("../errors/duplicateError");

exports.create = async (data) => {
	const newUser = _.pick(data, ["userName", "email", "password"]);
	const newOrg = _.pick(data, ["name"]);

	await validateUser(newUser);
	await validateOrg(newOrg);

	let user, token;
	try {
		await _db.transaction(async (t) => {
			user = await createUserOrg(newUser, newOrg.name, "Administrator", t);

			const org = { OrganizationName: user.Organizations[0].name, permission: "Administrator" };
			token = await generateAuthToken(user, [org]);
		});
	} catch (err) {
		if (err && err.errors && err.errors[0] && err.errors[0].message === "email must be unique") throw new DuplicateError("user", err.errors[0].value, "email");
		if (err && err.errors && err.errors[0] && err.errors[0].message === "name must be unique") throw new DuplicateError("organization", err.errors[0].value, "name");
		throw err;
	}
	return { user, token };
};

exports.getAllFromUserWithApiKeys = async (user) => {
	return await getUserOrgsWithApiKeys(user.organizations);
};

exports.getAllApiKeys = async () => {
	return await OrganizationDAO.findAll({ attributes: ["name", "apiKey"] });
};

async function getUserOrgsWithApiKeys(organizations) {
	const orgsIsAdmin = organizations.filter((o) => o.permission === "Administrator");
	const orgsIsAdminParsed = orgsIsAdmin.map(({ OrganizationName }) => OrganizationName);

	const apiKeys = await OrganizationDAO.findAll({ where: { name: orgsIsAdminParsed }, attributes: ["name", "apiKey"] });

	apiKeys.forEach((k) => {
		const index = organizations.findIndex((o) => o.OrganizationName === k.name);
		organizations[index].apiKey = k.apiKey;
	});

	return organizations;
}
