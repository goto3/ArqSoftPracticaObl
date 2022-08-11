var rules = require("../rules.js");
var loadedPolicies = {};

(function loadPolicies() {
    var normalizedPath = require("path").join(__dirname, "policies");
    require("fs").readdirSync(normalizedPath).forEach(function (file) {
        var extension = file.split(".")[1];
        if (extension && (extension.toLowerCase() == "js" || extension.toLowerCase() == "ts")){
            loadedPolicies[(file.split(".")[0])] = require("./policies/" + file);
        }
    });
})();

module.exports.evaluateInboundPolicies = async (url, req, res) => {
    policies = matchPipeline(rules.pipelines.inbound, url, req.method);
    await executeInboundPipeline(policies, url, req, res);
};

module.exports.evaluateOutboundPolicies = async (proxyRes, req, res) => {
    policies = matchPipeline(rules.pipelines.outbound, proxyRes.req.path, proxyRes.req.method, proxyRes.statusCode);
    await executeOutboundPipeline(policies, proxyRes, req, res);
};

async function executeInboundPipeline(policies, url, req, res) {
    let i = 0;
    while (i < policies.length) {
        if (!loadedPolicies[policies[i].name]) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `Gateway error: unmatched policy ${policies[i].name}` }));
            return;
        }
        try {
            var finish = await (loadedPolicies[policies[i].name][policies[i].method.toString()](url, req, res)) || false;
            if (finish) return;
        } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `Gateway error: policy ${policies[i].name} failed on method ${policies[i].method}` }));
            return;
        }
        i++;
    }
}

async function executeOutboundPipeline(policies, proxyRes, req, res) {
    let i = 0;
    while (i < policies.length) {
        if (!loadedPolicies[policies[i].name]) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `Gateway error: unmatched policy ${policies[i].name}` }));
            return;
        }
        try {
            var finish = await (loadedPolicies[policies[i].name][policies[i].method.toString()](proxyRes, req, res)) || false;
            if (finish) return;
        } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `Gateway error: policy ${policies[i].name} failed on method ${policies[i].method}` }));
            return;
        }
        i++;
    }
}

function matchPipeline(pipelines, path, method, statusCode = -1) {
    for (var pipeline of pipelines) {
        var pipelinePath = pipeline.match.request.path;
        if (!pipelinePath) return [];
        var pipelinePathRe;
        if (pipelinePath[pipelinePath.length - 1] === "/") {
            pipelinePathRe = new RegExp(pipelinePath);
        } else {
            pipelinePathRe = new RegExp("(" + pipelinePath + ")" + "(?:\\W|$)");
        }
      	var result = pipelinePathRe.exec(path);
        if (pipeline.match.request.method.toLowerCase() == method.toLowerCase() && result && result.length > 0){
            if (!pipeline.match.response || pipeline.match.response.statusCode === statusCode) return pipeline.policies;
            return [];
        }       
    }
  	return [];
}