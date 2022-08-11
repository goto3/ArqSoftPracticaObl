const formData = require("form-data");
const Mailgun = require("mailgun.js");

const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.EMAILDOMAIN;
const frontendhost = process.env.FRONTENDHOST;

const mailgun = new Mailgun(formData);
const _mg = mailgun.client({ username: "api", key: api_key });

module.exports.sendEmail = async (data) => {
	var info = {
		from: `ASP <no-reply@${domain}.com>`,
		to: [data.to],
		subject: `Invitation to join ${data.organization}`,
		text: `${frontendhost}/app/invite/${data.hash}`,
		html: `${frontendhost}/app/invite/${data.hash}`,
	};
	await _mg.messages.create(domain, info);

	console.info(`Email sent successfully: ${JSON.stringify(info)}`);
};

module.exports.sendNotification = async (data) => {
	var info = {
		from: `ASP <no-reply@${domain}.com>`,
		to: [data.user],
		subject: `Book reservation reminder`,
		text: `You have a book to return due tomorrow: Organization: '${data.organization}', isbn '${data.bookIsbn}', End date: ${data.endDate}.`,
		html: `You have a book to return due tomorrow: Organization: '${data.organization}', isbn '${data.bookIsbn}', End date: ${data.endDate}.`,
	};
	await _mg.messages.create(domain, info);

	console.info(`Email sent successfully: ${JSON.stringify(info)}`);
};
