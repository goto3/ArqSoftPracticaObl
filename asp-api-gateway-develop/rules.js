/*
    Use http://[CONTAINER_NAME]:[PORT]/api in each environment variable.
    example:
        BOOKS_API=http://asp-books_api_1:4300/api
    Alternatively, run this command to get your containers ip:
    $ docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' [CONTAINER_NAME]
    example:
        $ docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' asp-reservations_api_1
*/
module.exports.routes = {
	".*/api/organizations": process.env.TENANCY_API + "/organizations",
	".*/api/auth": process.env.TENANCY_API + "/auth",
	".*/api/invites": process.env.TENANCY_API + "/invites",
	".*/api/users": process.env.TENANCY_API + "/users",
	".*/api/books": process.env.BOOKS_API + "/books",
	".*/api/reservations": process.env.BOOKS_API + "/reservations",
	".*/api/reviews": process.env.REVIEWS_API + "/reviews",
	".*/api/notifications": process.env.NOTIFICATIONS_API + "/notifications",
	".*/api/queries": process.env.QUERIES_API + "/queries",
};

module.exports.pipelines = {
	inbound: [
		{
			match: {
				request: {
					path: ".*/api/queries",
					method: "GET",
				},
			},
			policies: [{ name: "api-key", method: "authorize" }],
		},
	],
	outbound: [
		{
			match: {
				request: {
					path: ".*/api/organizations",
					method: "POST",
				},
				response: {
					statusCode: 200,
				},
			},
			policies: [{ name: "api-key", method: "insert" }],
		},
		{
			match: {
				request: {
					path: ".*/api/organizations/.*/apiKey",
					method: "PUT",
				},
				response: {
					statusCode: 200,
				},
			},
			policies: [{ name: "api-key", method: "update" }],
		},
	],
};
