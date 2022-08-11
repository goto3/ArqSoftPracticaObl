const moment = require("moment");
const { delete: deleteReview } = require("../services/reviewService");
const { ReviewDAO } = require("../models/review");

describe("Tests - Review service - Delete", () => {
	const user = { organizations: [{ OrganizationName: "organization1", permission: "Student" }], userEmail: "email@email.com" };

	it("Should delete a review", async () => {
		const review = { id: 1 };

		jest.spyOn(ReviewDAO, "findByPk").mockReturnValueOnce({ id: 1, owner: "email@email.com", organization: "organization1", bookId: 1, rating: 1, review: "review", createdAt: moment().format() });
		jest.spyOn(ReviewDAO, "destroy").mockReturnValueOnce(1);

		await deleteReview(user, review);

		expect(ReviewDAO.findByPk).toBeCalledWith(review.id);
		expect(ReviewDAO.destroy).toBeCalledWith({
			where: {
				id: review.id,
			},
		});
	});

	it("Should return validation error", async () => {
		const review = {};

		try {
			const result = await deleteReview(user, review);
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

	it("Should return an error due review too old", async () => {
		const review = { id: 1 };

		jest.spyOn(ReviewDAO, "findByPk").mockReturnValueOnce({
			id: 1,
			owner: "email@email.com",
			organization: "organization1",
			bookId: 1,
			rating: 1,
			review: "review",
			createdAt: moment().add(-1, "day").format(),
		});

		try {
			await deleteReview(user, review);
		} catch (err) {
			expect(err.error.code).toEqual("review.delete.tooOld");
		}

		expect(ReviewDAO.findByPk).toBeCalledWith(review.id);
	});

	it("Should return not found error", async () => {
		const review = { id: 1 };

		jest.spyOn(ReviewDAO, "findByPk").mockReturnValueOnce(null);

		try {
			await deleteReview(user, review);
		} catch (err) {
			expect(err.StatusCode).toEqual(404);
		}

		expect(ReviewDAO.findByPk).toBeCalledWith(review.id);
	});
});
