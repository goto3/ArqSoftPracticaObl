## ASP-SDK-Queries

SDK for ASP-Queries API, fetches all reservations from a specific book for a date range. Requires organization Api key.

## Instructions

Example use:

```javascript
const sdk = require("asp-sdk-queries");
const moment = require("moment");

const apiURL = "http://hostname/api/queries/reservations/";
const apiKey = "b12a1469-2182-4e2d-a3db-57c392172cee";
const bookId = 1;
const startDate = moment().format("YYYY-MM-DD");
const endDate = moment().add(5, "days").format("YYYY-MM-DD");

(async () => {
	const reservations = await sdk.fetch(apiURL, apiKey, bookId, startDate, endDate);

	console.log("Reservations: ", reservations.response.data);
})();
```

Where:

-   apiURL: API URL starting with "http://" and ending with "/api/queries/reservations/"
-   apiKey: Organization api key
-   bookId: ID from the book to fetch reservations
-   startDate: Start date with format "YYYY-MM-DD"
-   endDate: End date with format "YYYY-MM-DD"
