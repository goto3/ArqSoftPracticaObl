const { getAll } = require("../services/reviewService");
const { ReviewDAO } = require("../models/review");

describe("Tests - Review service - Get all", () => {
	const user = { organizations: [{ OrganizationName: "organization1", permission: "Student" }], email: "email@email.com" };

	it("Should get all reviews", async () => {
		const query = { organization: "organization1", bookId: "1", page: 1, limit: 10, own: "false" };

		jest.spyOn(ReviewDAO, "count").mockReturnValueOnce(1);
		jest.spyOn(ReviewDAO, "findAndCountAll").mockReturnValueOnce({ rows: [{ id: 1, owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" }], count: 1 });

		const result = await getAll(user, query);

		expect(ReviewDAO.count).toBeCalledWith({
			where: {
				organization: "organization1",
				bookId: parseInt(query.bookId),
			},
		});
		expect(ReviewDAO.findAndCountAll).toBeCalledWith({
			where: {
				organization: "organization1",
				bookId: parseInt(query.bookId),
			},
			order: [["createdAt", "DESC"]],
			limit: query.limit,
			offset: 0,
		});

		expect(result).toEqual({ page: query.page, limit: query.limit, rows: [{ id: 1, owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" }], count: 1 });
	});

	it("Should get all reviews on page 2", async () => {
		const query = { organization: "organization1", bookId: "1", page: 2, limit: 1, own: "false" };

		jest.spyOn(ReviewDAO, "count").mockReturnValueOnce(10);
		jest.spyOn(ReviewDAO, "findAndCountAll").mockReturnValueOnce({
			rows: [{ id: 2, owner: "email2@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" }],
			count: 1,
		});

		const result = await getAll(user, query);

		expect(ReviewDAO.count).toBeCalledWith({
			where: {
				organization: "organization1",
				bookId: parseInt(query.bookId),
			},
		});
		expect(ReviewDAO.findAndCountAll).toBeCalledWith({
			where: {
				organization: "organization1",
				bookId: parseInt(query.bookId),
			},
			order: [["createdAt", "DESC"]],
			limit: query.limit,
			offset: 1,
		});

		expect(result).toEqual({
			page: query.page,
			limit: query.limit,
			rows: [{ id: 2, owner: "email2@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" }],
			count: 1,
		});
	});

	it("Should get review for a specific user and book", async () => {
		const query = { organization: "organization1", bookId: "1", page: 1, limit: 10, own: "true" };

		jest.spyOn(ReviewDAO, "findOne").mockReturnValueOnce({ id: 1, owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" });

		const result = await getAll(user, query);

		expect(ReviewDAO.findOne).toBeCalledWith({
			where: {
				owner: "email@email.com",
				organization: query.organization,
				bookId: parseInt(query.bookId),
			},
		});

		expect(result).toEqual({ id: 1, owner: "email@email.com", organization: "organization1", bookId: 1, rating: 5, review: "Review" });
	});

	it("Should return validation error", async () => {
		const query = { bookId: "1", page: 1, limit: 10, own: "false" };

		try {
			await getAll(user, query);
			throw new Error("Execution was expected to fail but it didn't.");
		} catch (err) {
			expect(err.error.details[0]).toEqual({
				message: '"organization" is required',
				path: ["organization"],
				type: "any.required",
				context: {
					label: "organization",
					key: "organization",
				},
			});
		}
	});

	it("Should return validation error", async () => {
		const query = { organization: "organization", bookId: "1", page: 1, limit: 10, own: "false" };

		try {
			await getAll(user, query);
			throw new Error("Execution was expected to fail but it didn't.");
		} catch (err) {
			expect(err.message).toEqual("Insufficient permissions to perform this action on organization 'organization'.");
		}
	});
});
