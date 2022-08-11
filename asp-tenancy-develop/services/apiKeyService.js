const ApiKey = require("../models/apiKey");

const AuthError = require("../errors/authError");

exports.get = async (user, organization) => {
	validateUserOrg(user.organizations, organization, "Administrator");

	const org = await ApiKey.find(organization);
	return org.apiKey;
};

exports.renew = async (user, organization) => {
	validateUserOrg(user.organizations, organization, "Administrator");

	return await ApiKey.renew(organization);
};

function validateUserOrg(organizations, orgName, permission) {
	const found = organizations.find((o) => o.OrganizationName.toLowerCase() === orgName.toLowerCase() && o.permission === permission);
	if (!found) throw new AuthError(`Insufficient permissions to perform this action on organization '${orgName}'.`);
}
