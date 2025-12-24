"use strict";

const { ObjectId } = require("mongodb");
const connect = require("../connection");

module.exports = function (app) {
	app
		.route("/api/issues/:project")

		.get(async function (req, res) {
			const project = req.params.project;
			const db = req.app.locals.db;

			if (!db) {
				return res.status(500).json({ error: "db not initialized" });
			}

			const filters = {};

			for (const [key, value] of Object.entries(req.query)) {
				if (key === "open") {
					filters.open = value === "true";
					continue;
				}

				if (key === "_id") {
					try {
						filters._id = new ObjectId(value);
					} catch (e) {
						return res.json([]);
					}
					continue;
				}

				filters[key] = value;
			}

			try {
				const issues = await db.collection(project).find(filters).toArray();
				return res.json(issues);
			} catch (err) {
				console.error(err);
				return res.status(500).json({ error: "db error" });
			}
		})

		.post(async function (req, res) {
			const {
				issue_title,
				issue_text,
				created_by,
				assigned_to = "",
				status_text = "",
			} = req.body;

			const db = req.app.locals.db;

			if (!db) {
				return res.status(500).json({ error: "db not initialized" });
			}

			if (!issue_title || !issue_text || !created_by) {
				return res.json({ error: "required field(s) missing" });
			}

			const now = new Date();
			const issue = {
				issue_title,
				issue_text,
				created_by,
				assigned_to,
				status_text,
				created_on: now,
				updated_on: now,
				open: true,
			};

			try {
				const result = await db.collection(req.params.project).insertOne(issue);
				return res.json({ ...issue, _id: result.insertedId });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ error: "db error" });
			}
		})

		.put(async function (req, res) {
			const project = req.params.project;
			const { _id } = req.body;
			const db = req.app.locals.db;

			if (!_id) {
				return res.json({ error: "missing _id" });
			}

			if (!db) {
				return res.status(500).json({ error: "db not initialized" });
			}

			const fields = [
				"issue_title",
				"issue_text",
				"created_by",
				"assigned_to",
				"status_text",
				"open",
			];

			const updates = {};
			fields.forEach((field) => {
				if (req.body[field] !== undefined && req.body[field] !== "") {
					if (field === "open") {
						updates.open = req.body[field] === "false" ? false : true;
					} else {
						updates[field] = req.body[field];
					}
				}
			});

			if (Object.keys(updates).length === 0) {
				return res.json({ error: "no update field(s) sent", _id });
			}

			updates.updated_on = new Date();

			let objectId;
			try {
				objectId = new ObjectId(_id);
			} catch (e) {
				return res.json({ error: "could not update", _id });
			}

			try {
				const result = await db
					.collection(project)
					.updateOne({ _id: objectId }, { $set: updates });

				if (result.matchedCount === 0) {
					return res.json({ error: "could not update", _id });
				}

				return res.json({ result: "successfully updated", _id });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ error: "db error" });
			}
		})

		.delete(async function (req, res) {
			const project = req.params.project;
			const { _id } = req.body;
			const db = req.app.locals.db;

			if (!_id) {
				return res.json({ error: "missing _id" });
			}

			if (!db) {
				return res.status(500).json({ error: "db not initialized" });
			}

			let objectId;
			try {
				objectId = new ObjectId(_id);
			} catch (e) {
				return res.json({ error: "could not delete", _id });
			}

			try {
				const result = await db.collection(project).deleteOne({ _id: objectId });

				if (result.deletedCount === 0) {
					return res.json({ error: "could not delete", _id });
				}

				return res.json({ result: "successfully deleted", _id });
			} catch (err) {
				console.error(err);
				return res.status(500).json({ error: "db error" });
			}
		});
};
