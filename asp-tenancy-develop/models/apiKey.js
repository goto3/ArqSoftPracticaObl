const Joi = require("joi");
const { OrganizationDAO } = require("./organization");
const { v4: uuidv4 } = require("uuid");

const NotFoundError = require("../errors/notFoundError");

module.exports.find = async (organization) => {
	return await OrganizationDAO.findOne({
		where: {
			name: organization.toLowerCase(),
		},
		attributes: ["name", "apiKey"],
	});
};

module.exports.renew = async (organization) => {
	const org = await OrganizationDAO.findOne({
		where: {
			name: organization.toLowerCase(),
		},
	});
	if (!org) throw new NotFoundError("organization", organization);
	org.apiKey = uuidv4();
	await org.save();

	return org.apiKey;
};
