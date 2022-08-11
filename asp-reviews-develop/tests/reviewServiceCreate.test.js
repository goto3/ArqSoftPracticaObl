const { create } = require("../services/reviewService");
const { BookDAO } = require("../models/book");
const { ReviewDAO } = require("../models/review");

describe("Tests - Review service - Create", () => {
	const user = { organizations: [{ OrganizationName: "organization1", permission: "Student" }], userEmail: "email@email.com" };

	it("Should create a review", async () => {
		const review = { owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" };

		jest.spyOn(BookDAO, "findByPk").mockReturnValueOnce({ id: 1, isbn: 1234567890123, organization: "organization1", title: "book title", authors: "book authors", year: 1999, copiesAmount: 5 });
		jest.spyOn(ReviewDAO, "create").mockReturnValueOnce({ owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" });

		const result = await create(user, review);

		expect(BookDAO.findByPk).toBeCalledWith(1);
		expect(ReviewDAO.create).toBeCalledWith({ owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" });

		expect(result).toEqual({ owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" });
	});

	it("Should should fail on validating review parameters", async () => {
		const review = { organization: "organization1", bookId: 1, rating: 5, review: "Review" };

		try {
			await create(user, review);
			throw new Error("Execution was expected to fail but it didn't.");
		} catch (err) {
			expect(err.error.details[0]).toEqual({
				message: '"owner" is required',
				path: ["owner"],
				type: "any.required",
				context: {
					label: "owner",
					key: "owner",
				},
			});
		}
	});

	it("Should should fail on validating user permissions", async () => {
		const review = { owner: "email@email.com", organization: "organization", bookId: 1, rating: 5, review: "Review" };

		try {
			await create(user, review);
			throw new Error("Execution was expected to fail but it didn't.");
		} catch (err) {
			expect(err.message).toEqual("Insufficient permissions to perform this action on organization 'organization'.");
		}
	});

	it("Should should fail on validating book existence", async () => {
		const review = { owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" };

		jest.spyOn(BookDAO, "findByPk").mockReturnValueOnce(null);

		try {
			await create(user, review);
			throw new Error("Execution was expected to fail but it didn't.");
		} catch (err) {
			expect(err.StatusCode).toEqual(404);
		}
		expect(BookDAO.findByPk).toBeCalledWith(1);
	});

	it("Should should fail on validating book existence", async () => {
		const review = { owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" };

		jest.spyOn(BookDAO, "findByPk").mockReturnValueOnce({ id: 1, isbn: 1234567890123, organization: "organization1", title: "book title", authors: "book authors", year: 1999, copiesAmount: 5 });
		jest.spyOn(ReviewDAO, "create").mockImplementation(() => {
			throw { errors: [{ type: "unique violation" }] };
		});

		try {
			await create(user, review);
			throw new Error("Execution was expected to fail but it didn't.");
		} catch (err) {
			expect(err.StatusCode).toEqual(400);
			expect(err.key).toEqual("[UserEmail:OrganizationName:bookId]");
		}
		expect(BookDAO.findByPk).toBeCalledWith(1);
	});
});
