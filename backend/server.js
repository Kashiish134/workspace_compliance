/**
 * Workspace Compliance System: sample REST API (Express).
 *
 * Implements the same /api/... contract the React app calls, on http://localhost:7079.
 * Business rules and seed data come from ../src/api/mockCore.js (shared with the browser
 * demo mode). State is persisted to backend/data/db.json; uploaded evidence files are
 * stored in backend/uploads and served from /uploads.
 *
 *   npm run server          start the API only
 *   npm run dev             start the API and the React app together
 *   POST /api/reset         reset the sample data to its initial state
 *
 * Note: authentication is simulated. Log in as employee / ro / hr / payroll (any password).
 */
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { handle, newDb } = require("../src/api/mockCore");

function createApp({ dataDir = path.join(__dirname, "data"), uploadDir = path.join(__dirname, "uploads") } = {}) {
	fs.mkdirSync(dataDir, { recursive: true });
	fs.mkdirSync(uploadDir, { recursive: true });
	const dbFile = path.join(dataDir, "db.json");

	let db;
	try {
		db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
	} catch (e) {
		db = newDb();
	}
	let saveTimer;
	const saveDb = () => {
		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => fs.writeFile(dbFile, JSON.stringify(db), () => {}), 100);
	};

	const upload = multer({
		storage: multer.diskStorage({
			destination: uploadDir,
			filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/[^\w.\-]/g, "_")),
		}),
		limits: { fileSize: 10 * 1024 * 1024 },
	});

	const app = express();
	app.use(cors());
	app.use(express.json({ limit: "2mb" }));
	app.use("/uploads", express.static(uploadDir));

	app.get("/api/health", (req, res) => res.json({ status: "ok", service: "workspace-compliance-api" }));
	app.post("/api/reset", (req, res) => {
		db = newDb();
		saveDb();
		res.json({ success: true, message: "Sample data reset." });
	});

	app.all("/api/*", upload.any(), (req, res) => {
		try {
			const endpoint = req.originalUrl.replace(/^\/api/, ""); // keeps the query string
			let body = req.body;
			if (req.files && req.files.length > 0) {
				const f = req.files[0];
				const fileShim = { name: f.originalname, url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}` };
				body = { get: (key) => (key === "file" ? fileShim : null) };
			}
			const result = handle(endpoint, { method: req.method, body }, db);
			saveDb();
			res.json(result);
		} catch (err) {
			console.error(err);
			res.status(500).json({ success: false, message: "Server error: " + err.message });
		}
	});

	return { app, getDb: () => db };
}

module.exports = { createApp };

if (require.main === module) {
	const PORT = process.env.API_PORT || 7079; // not PORT: React's dev server reads that one
	const { app } = createApp();
	app.listen(PORT, () => console.log(`Workspace Compliance API listening on http://localhost:${PORT}/api`));
}
