const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
	this.timeout(5000);

	let requester;
	let validId;

	before(function () {
		requester = chai.request(server).keepOpen();
	});

	after(function () {
		requester.close();
	});

	// #1
	test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
		requester
			.post("/api/issues/test")
			.send({
				issue_title: "Test Issue",
				issue_text: "This is a test issue",
				created_by: "Tester",
				assigned_to: "Assignee",
				status_text: "In Progress",
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.issue_title, "Test Issue");
				assert.equal(res.body.issue_text, "This is a test issue");
				assert.equal(res.body.created_by, "Tester");
				assert.equal(res.body.assigned_to, "Assignee");
				assert.equal(res.body.status_text, "In Progress");
				assert.exists(res.body._id);
				validId = res.body._id;
				done();
			});
	});

	// #2
	test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
		requester
			.post("/api/issues/test")
			.send({
				issue_title: "Test Issue",
				issue_text: "This is a test issue",
				created_by: "Tester",
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.issue_title, "Test Issue");
				assert.equal(res.body.issue_text, "This is a test issue");
				assert.equal(res.body.created_by, "Tester");
				done();
			});
	});

	// #3
	test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
		requester
			.post("/api/issues/test")
			.send({
				issue_title: "Test Issue",
				issue_text: "This is a test issue",
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.error, "required field(s) missing");
				done();
			});
	});

	// #4
	test("View issues on a project: GET request to /api/issues/{project}", function (done) {
		requester.get("/api/issues/test").end(function (err, res) {
			assert.equal(res.status, 200);
			assert.isArray(res.body);
			done();
		});
	});

	// #5
	test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
		requester
			.get("/api/issues/test?assigned_to=Assignee")
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isArray(res.body);
				res.body.forEach((issue) => {
					assert.equal(issue.assigned_to, "Assignee");
				});
				done();
			});
	});

	// #6
	test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
		requester
			.get("/api/issues/test?open=true&issue_title=Test%20Issue")
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isArray(res.body);
				res.body.forEach((issue) => {
					assert.equal(issue.issue_title, "Test Issue");
					assert.isTrue(issue.open);
				});
				done();
			});
	});

	// #7
	test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
		requester
			.put("/api/issues/test")
			.send({ _id: validId, status_text: "Updated status" })
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, {
					result: "successfully updated",
					_id: validId,
				});
				done();
			});
	});

	// #8
	test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
		requester
			.put("/api/issues/test")
			.send({ _id: validId, issue_text: "Updated text", open: false })
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, {
					result: "successfully updated",
					_id: validId,
				});
				done();
			});
	});

	// #9
	test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
		requester
			.put("/api/issues/test")
			.send({ issue_title: "No id" })
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, { error: "missing _id" });
				done();
			});
	});

	// #10
	test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
		requester
			.put("/api/issues/test")
			.send({ _id: validId })
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, {
					error: "no update field(s) sent",
					_id: validId,
				});
				done();
			});
	});

	// #11
	test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
		requester
			.put("/api/issues/test")
			.send({ _id: "invalidid123", issue_title: "Bad id" })
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, {
					error: "could not update",
					_id: "invalidid123",
				});
				done();
			});
	});

	// #12
	test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
		requester
			.delete("/api/issues/test")
			.send({ _id: validId })
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, {
					result: "successfully deleted",
					_id: validId,
				});
				done();
			});
	});

	// #13
	test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
		requester
			.delete("/api/issues/test")
			.send({ _id: "invalidid123" })
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, {
					error: "could not delete",
					_id: "invalidid123",
				});
				done();
			});
	});

	// #14
	test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
		requester
			.delete("/api/issues/test")
			.send({})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.deepEqual(res.body, { error: "missing _id" });
				done();
			});
	});
});
