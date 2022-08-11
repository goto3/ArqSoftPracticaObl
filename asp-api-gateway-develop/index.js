require("newrelic");
var http = require("http");
var httpProxy = require("http-proxy");
var HttpProxyRules = require("http-proxy-rules");
require("./start/envCheck")();
const redis = require("./start/redis");
var policies = require("./helpers/policies");
var rules = require("./rules");

var proxyRules = new HttpProxyRules({
	rules: rules.routes,
});

var proxy = httpProxy.createProxyServer({
	changeOrigin: true,
	proxyTimeout: 15000,
});

proxy.on("proxyRes", async function (proxyRes, req, res) {
	await policies.evaluateOutboundPolicies(proxyRes, req, res);
});

var server = http.createServer(async function (req, res) {
	if (req.url.toLowerCase() == "/api/healthcheck" && req.method == "GET") {
		var status = redis.healthcheck();
		if (status.redisConnection) {
			res.writeHead(200, { "Content-Type": "application/json" });
		} else {
			res.writeHead(500, { "Content-Type": "application/json" });
		}
		res.end(JSON.stringify(status));
		return;
	}
	var target = proxyRules.match(req);
	if (target) {
		await policies.evaluateInboundPolicies(target, req, res);
		return proxy.web(
			req,
			res,
			{
				target: target,
			},
			(e, req, res) => {
				if (e.code == "EAI_AGAIN" || e.code == "ECONNREFUSED") {
					console.error(JSON.stringify(e));
					res.writeHead(503, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Service is currently unavailable" }));
				} else {
					res.end(JSON.stringify(e));
				}
				return;
			}
		);
	}
	res.writeHead(404, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ error: "The resource you're looking up doesn't exist" }));
});

var port = process.env.PORT || 4299;
console.info(`listening on port ${port}`);
server.listen(port);
