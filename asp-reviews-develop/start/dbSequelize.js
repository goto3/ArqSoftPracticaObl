const { Sequelize } = require("sequelize");

const DB_CONNECTION = process.env.DB_CONNECTION || "postgres://postgres:admin@postgres-reviews:5432/asp-reviews";

const sequelize = new Sequelize(DB_CONNECTION, {
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	logging: false,
});

module.exports = sequelize;
