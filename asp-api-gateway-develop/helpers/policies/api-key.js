const { client } = require("../../start/redis");

module.exports.insert = (proxyRes, req, res) => {
	var bodyChunks = Buffer.from([]);
	proxyRes.on("data", (data) => {
		bodyChunks = Buffer.concat([bodyChunks, data]);
	});

	proxyRes.on("end", async () => {
		try {
			let body = JSON.parse(bodyChunks.toString());
			await handleInsert(body);
		} catch (e) {
			console.error(`Response is not a valid JSON: ${bodyChunks.toString()}`);
		}
	});
	return true;
};

async function handleInsert(body) {
	body.user.Organizations.forEach(async (o) => {
		client.set(`org_${o.name}`, o.apiKey);
		client.set(`orgKey_${o.apiKey}`, o.name);
	});
}

module.exports.update = (proxyRes, req, res) => {
	var bodyChunks = Buffer.from([]);
	proxyRes.on("data", (data) => {
		bodyChunks = Buffer.concat([bodyChunks, data]);
	});

	proxyRes.on("end", async () => {
		try {
			let body = JSON.parse(bodyChunks.toString());
			await handleUpdate(body, req.url.match("/(.*)/")[1]);
		} catch (e) {
			console.error(`Response is not a valid JSON: ${bodyChunks.toString()}`);
		}
	});
	return true;
};

async function handleUpdate(body, orgName) {
	let currentKey = await client.getAsync(`org_${orgName}`);
	if (!currentKey || currentKey != body.apiKey) {
		client.del(`orgKey_${currentKey}`);
		client.set(`org_${orgName}`, body.newKey);
		client.set(`orgKey_${body.newKey}`, orgName);
	}
}

module.exports.authorize = async (url, req, res) => {
    let i = req.rawHeaders.indexOf("x-api-key");
    if (i === -1){
        res.writeHead(401);
        res.end();
        return false;
    }
    let organization = await client.getAsync(`orgKey_${req.rawHeaders[i+1]}`);
    if (!organization){
        res.writeHead(401);
        res.end();
        return false;
    }
    delete req.headers["x-api-key"];
    req.headers.organization = organization;
    return true;
};

