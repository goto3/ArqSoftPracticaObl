const bcrypt = require("bcryptjs");
const InvalidCredentialsError = require("../errors/invalidCredentialsError");
const { UserDAO, validateCredentials, generateAuthToken } = require("../models/user");
const { getUserOrgs } = require("../models/userOrganization");

exports.logIn = async (credentials) => {
	await validateCredentials(credentials);

	let user = await UserDAO.findOne({ where: { email: credentials.email.toLowerCase() } });
	if (!user) throw new InvalidCredentialsError();

	const validPassword = await bcrypt.compare(credentials.password, user.password);
	if (!validPassword) throw new InvalidCredentialsError();

	const orgs = await getUserOrgs(user.email);
	const token = generateAuthToken(user, orgs);

	return token;
};
