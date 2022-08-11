require("newrelic");
require("./start/envCheck")();

(async () => {
	require("./start/amqpConnection").connect();
})();
