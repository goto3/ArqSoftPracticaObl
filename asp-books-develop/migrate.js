const sequelize = require("./start/dbSequelize");
require("./start/envCheck")();

// Require all files in ./models
require("fs")
	.readdirSync(require("path").join(__dirname, "models"))
	.forEach(function (file) {
		require("./models/" + file);
	});

const force = process.argv.includes("--force=true");

(async () => {
	try {
		console.info("Migrating Database and installing extensons...");
		await sequelize.query("CREATE EXTENSION IF NOT EXISTS btree_gist", { raw: true });
		await sequelize.query("CREATE EXTENSION IF NOT EXISTS pg_trgm", { raw: true });

		await sequelize.sync({ force });
		console.info("Database successfully migrated.");
	} catch (err) {
		console.error("Database connection error", err);
	}
	process.exit(0);
})();
