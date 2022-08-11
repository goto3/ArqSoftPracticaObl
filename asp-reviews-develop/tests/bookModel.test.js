const { BookDAO, validateBook, validateExistsBookInOrg } = require("../models/book");

describe("/api/auth", () => {
	it("Should validate a new book", async () => {
		const book = { id: 1, isbn: "1234567890123", organization: "organization", title: "book title", authors: "authors", year: 1999, copiesAmount: 10 };

		validateBook(book);
	});

	it("Should throw validation error", async () => {
		const book = { isbn: "1234567890123", organization: "organization", title: "book title", authors: "authors", year: 1999, copiesAmount: 10 };

		try {
			await validateBook(book);
			throw new Error("Execution was expected to fail but it didn't.");
		} catch (err) {
			expect(err.error.details[0]).toEqual({
				message: '"id" is required',
				path: ["id"],
				type: "any.required",
				context: {
					label: "id",
					key: "id",
				},
			});
		}
	});

	it("Should throw duplicate error", async () => {
		const book = { id: 1, isbn: "1234567890123", organization: "organization", title: "book title", authors: "authors", year: 1999, copiesAmount: 10 };

		jest.spyOn(BookDAO, "findByPk").mockReturnValueOnce(book);

		try {
			await validateExistsBookInOrg(1, "organization", false);
			throw new Error("Execution was expected to fail but it didn't.");
		} catch (err) {
			expect(err.StatusCode).toEqual(400);
		}
	});
});
