const { Sequelize } = require("sequelize");

const dbConnection = process.env.DB_CONNECTION || "postgres://postgres:admin@postgres-books:5432/asp-books";

const sequelize = new Sequelize(dbConnection, {
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	logging: false,
});

module.exports = sequelize;
