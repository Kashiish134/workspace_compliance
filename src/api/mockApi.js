/**
 * In-browser demo mode (REACT_APP_DEMO_MODE=true): answers API calls from the shared
 * sample core (mockCore.js) with state kept in sessionStorage. Signing out resets it.
 */
import { handle, newDb, clone } from "./mockCore";

const DB_KEY = "wcsDemoDb.v1";
const LATENCY_MS = process.env.NODE_ENV === "test" ? 0 : 200;

function loadDb() {
	try {
		const raw = sessionStorage.getItem(DB_KEY);
		if (raw) return JSON.parse(raw);
	} catch (e) {
		/* ignore */
	}
	return newDb();
}
function saveDb(db) {
	try {
		sessionStorage.setItem(DB_KEY, JSON.stringify(db));
	} catch (e) {
		/* ignore */
	}
}

/** Drop-in replacement for apiCall(): resolves with the mocked JSON payload. */
export function mockApiCall(endpoint, options = {}) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			try {
				const db = loadDb();
				const result = handle(endpoint, options, db);
				saveDb(db);
				resolve(clone(result));
			} catch (err) {
				console.error("[demo mode] mock API error", err);
				reject(err);
			}
		}, LATENCY_MS);
	});
}
