const Joi = require("joi");
const { getUsersToNotify, setAsNotified } = require("../models/reservation");
const { createUN, getUN, toggleUN } = require("../models/userNotification");
const amqp = require("../start/amqpConnection");

const AuthError = require("../errors/authError");
const JoiValidationError = require("../errors/joiValidationError");

const workerTimeout = parseInt(process.env.WORKERTIMEOUT || "60000");

exports.getFromUser = async (user, organization) => {
	const { error } = Joi.object({
		organization: Joi.string().required(),
	}).validate({ organization });
	if (error) throw new JoiValidationError(error);

	validateUserOrg(user.organizations, organization, "Student");

	let un = await getUN(user.email);
	if (!un) un = await createUN({ email: user.email });

	return un.notifications;
};

exports.toggle = async (user, organization) => {
	const { error } = Joi.object({
		organization: Joi.string().required(),
	}).validate({ organization });
	if (error) throw new JoiValidationError(error);

	validateUserOrg(user.organizations, organization, "Student");
	const { notifications } = await toggleUN(user.email);

	return notifications;
};

exports.worker = async () => {
	try {
		const reservationsToNotify = await getUsersToNotify();

		reservationsToNotify.forEach(async (r) => {
			await amqp.publishNotification(r);
			await setAsNotified(r);
		});
	} catch (err) {
		console.error("Could not check for notifications: ", err);
	}
	setTimeout(this.worker, workerTimeout);
};

function validateUserOrg(organizations, orgName, permission) {
	const found = organizations.find((o) => o.OrganizationName.toLowerCase() === orgName.toLowerCase() && o.permission === permission);
	if (!found) throw new AuthError(`Insufficient permissions to perform this action on organization '${orgName}'.`);
}
