const config = require("config");
const { DataTypes } = require("sequelize");
const _db = require("../start/dbSequelize");
const bcrypt = require("bcryptjs");

const { UserDAO } = require("./user");
const { OrganizationDAO } = require("./organization");

const ValidationError = require("../errors/validationError");

const permissions = config.get("permissions");

const UserOrganizationDAO = _db.define(
	"User_Organizations",
	{
		uid: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		permission: {
			type: DataTypes.ENUM(permissions),
			allowNull: false,
		},
	},
	{
		indexes: [
			{
				unique: false,
				fields: ["UserEmail"],
			},
			{
				unique: false,
				fields: ["OrganizationName"],
			},
		],
	}
);

UserDAO.belongsToMany(OrganizationDAO, { through: UserOrganizationDAO });
OrganizationDAO.belongsToMany(UserDAO, { through: UserOrganizationDAO });

module.exports.validateDuplicateUserOrg = async (org, email, transaction) => {
	const existsUserOrg = await UserOrganizationDAO.findOne({
		where: {
			UserEmail: email,
			OrganizationName: org,
		},
		transaction,
	});
	if (existsUserOrg) throw new ValidationError({ type: "Validation Error", code: "invite.userAlreadyBelongs", message: `User id '${email}' already belongs to '${org}'.` });
};

module.exports.getUserOrgs = async (email) => {
	const userOrgs = await UserOrganizationDAO.findAll({
		where: {
			UserEmail: email,
		},
	});
	return userOrgs;
};

module.exports.createUserOrg = async (user, organization, permission, transaction) => {
	const salt = await bcrypt.genSalt(8);
	const password = await bcrypt.hash(user.password, salt);
	const userData = {
		userName: user.userName,
		email: user.email.toLowerCase(),
		password,
		Organizations: [{ name: organization.toLowerCase(), User_Organizations: { permission: permission } }],
	};
	return await UserDAO.create(userData, { include: OrganizationDAO, transaction });
};

module.exports.joinOrganization = async (orgName, user, permission, transaction) => {
	await UserOrganizationDAO.create({ permission, UserEmail: user.email, OrganizationName: orgName }, { transaction });
};

module.exports.UserOrganizationDAO = UserOrganizationDAO;
