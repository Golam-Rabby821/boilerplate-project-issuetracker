"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const DB_NAME = process.env.DB_NAME || "issuetracker";
const PORT = process.env.PORT || 3000;

const app = express();
let client;

app.use("/public", express.static(process.cwd() + "/public"));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

fccTestingRoutes(app);
apiRoutes(app);

app.use(function (req, res) {
	res.status(404).type("text").send("Not Found");
});

async function start() {
	try {
		client = new MongoClient(process.env.MONGO_URI, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
		});
		await client.connect();
		app.locals.db = client.db(DB_NAME);
		console.log(`Connected to MongoDB, DB: ${DB_NAME}`);
		const listener = app.listen(PORT, () => {
			console.log(`Listening on ${PORT}`);
			if (process.env.NODE_ENV === "test") {
				console.log("Running Tests...");
				setTimeout(() => runner.run(), 3500);
			}
		});

		const shutdown = async () => {
			console.log("Shutting down...");
			listener.close(() => process.exit(0));
			if (client) await client.close();
		};
		process.on("SIGINT", shutdown);
		process.on("SIGTERM", shutdown);
	} catch (err) {
		console.error("Failed to initialize database connection:", err);
		process.exit(1); // fail fast
	}
}

start();

module.exports = app;
