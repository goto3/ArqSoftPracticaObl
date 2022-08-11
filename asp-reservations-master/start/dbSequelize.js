const { Sequelize } = require("sequelize");

const dbHostname = process.env.DBHOST;
const dbName = process.env.DBNAME;
const dbUser = process.env.DBUSER;
const dbPassword = process.env.DBPASSWORD;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
	host: dbHostname,
	dialect: "postgres",
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	logging: false,
});

module.exports = sequelize;
