/**
 * Framework-agnostic core of the sample Workspace Compliance API.
 *
 * handle(endpoint, options, db) answers every endpoint the UI calls with realistic
 * sample data and mutates the plain-object `db` (declarations, reviews, exceptions,
 * payroll jobs). It is shared by:
 *   - src/api/mockApi.js  : in-browser demo mode (db kept in sessionStorage)
 *   - backend/server.js   : the Express API on :7079 (db persisted to backend/data/db.json)
 *
 * Written as CommonJS so both webpack/Jest and plain Node can load it unchanged.
 * All names, e-mails and codes are fictional.
 */
const moment = require("moment");
const SAMPLE_FILE_URL = "/WCS_User_Manual.pdf";

const ORG = { orgUnit: "Corporate Services", companyName: "Acme Industries Ltd", locationName: "Gurugram HQ" };

/* ------------------------------------------------------------------ people */
const mkPerson = (globalCode, name, ro, location, department, designation) => ({
	globalCode,
	empCode: "E" + globalCode.replace(/\D/g, ""),
	name,
	email: name.toLowerCase().replace(/ /g, ".") + "@example.com",
	ro,
	location,
	department,
	designation,
});

const PEOPLE = [
	mkPerson("EMP1001", "Aarav Mehta", "RO2001", "Gurugram HQ", "Finance", "Senior Executive"),
	mkPerson("EMP1002", "Ishita Verma", "RO2001", "Gurugram HQ", "Finance", "Executive"),
	mkPerson("EMP1003", "Rohit Sinha", "RO2001", "Gurugram HQ", "Finance", "Analyst"),
	mkPerson("EMP1004", "Meera Joshi", "RO2001", "Gurugram HQ", "Finance", "Assistant Manager"),
	mkPerson("EMP1005", "Karan Malhotra", "RO2001", "Gurugram HQ", "Finance", "Executive"),
	mkPerson("EMP1006", "Sneha Reddy", "RO2001", "Gurugram HQ", "Finance", "Analyst"),
	mkPerson("EMP1007", "Vikram Singh", "RO2001", "Gurugram HQ", "Finance", "Senior Executive"),
	mkPerson("EMP1008", "Ananya Das", "RO2001", "Gurugram HQ", "Finance", "Executive"),
	mkPerson("RO2001", "Neha Kapoor", "HR3001", "Gurugram HQ", "Finance", "Manager"),
	mkPerson("EMP1009", "Tarun Bose", "HR3001", "Gurugram HQ", "Human Resources", "Executive"),
	mkPerson("HR3001", "Priya Nair", "DIR4001", "Gurugram HQ", "Human Resources", "Head - HR"),
	mkPerson("PAY5001", "Sandeep Rao", "HR3001", "Gurugram HQ", "Payroll", "Lead - Payroll"),
];
const DIRECTOR = mkPerson("DIR4001", "Rohan Verma", "", "Gurugram HQ", "Management", "Director");
const personByCode = (gc) => [...PEOPLE, DIRECTOR].find((p) => p.globalCode.toLowerCase() === String(gc).toLowerCase());

const PERSONAS = {
	employee: { code: "EMP1001", userRoles: [] },
	ro: { code: "RO2001", userRoles: [{ role: "RO", ...ORG }] },
	hr: { code: "HR3001", userRoles: [{ role: "RO", ...ORG }, { role: "HR Head", ...ORG }] },
	payroll: { code: "PAY5001", userRoles: [{ role: "Payroll", ...ORG }] },
};

const userPayload = (person, userRoles) => {
	const ro = personByCode(person.ro);
	return {
		globalCode: person.globalCode,
		empCode: person.empCode,
		name: person.name,
		email: person.email,
		emailId: person.email,
		roGlobalCode: ro?.globalCode ?? "",
		roEmail: ro?.email ?? "",
		userRoles,
	};
};

/* ------------------------------------------------------- payroll periods */
// Payroll month M runs from the 24th of M-1 to the 23rd of M.
function period(dateLike) {
	const d = dateLike ? moment(dateLike) : moment();
	const monthStart = d.clone().startOf("month");
	const start = monthStart.clone().subtract(1, "month").date(24).startOf("day");
	const weeks = [];
	for (let i = 0; i < 4; i++) {
		const ws = start.clone().add(i * 7, "days");
		const we = ws.clone().add(6, "days");
		weeks.push({ start: ws, label: `Week ${i + 1} (${ws.format("DD MMM")} - ${we.format("DD MMM")})` });
	}
	return {
		key: monthStart.format("YYYY-MM"),
		year: monthStart.year(),
		monthNum: monthStart.month() + 1,
		monthName: monthStart.format("MMMM"),
		start,
		weeks,
	};
}
function currentPeriod() {
	const t = moment();
	return period(t.date() > 23 ? t.clone().add(10, "days") : t);
}

/* ------------------------------------------------------------ compliance */
const WEEKLY_CATEGORY = "GPS411";
const MONTHLY_CATEGORIES = ["Workplace Safety Checklist", "Data Privacy Declaration"];

// R = reviewed, D = declared (awaiting RO), P = pending, SB = sent back, NC = non-compliance,
// NCX = non-compliance with an exception request raised, L = on leave
const WEEKLY_PATTERN = {
	EMP1001: ["R", "D", "SB", "P"],
	EMP1002: ["R", "R", "L", "D"],
	EMP1003: ["R", "D", "D", "P"],
	EMP1004: ["R", "R", "R", "D"],
	EMP1005: ["R", "SB", "D", "P"],
	EMP1006: ["R", "R", "D", "P"],
	EMP1007: ["R", "NCX", "D", "P"],
	EMP1008: ["D", "D", "P", "P"],
	RO2001: ["R", "R", "D", "P"],
	EMP1009: ["R", "R", "R", "D"],
	HR3001: ["R", "R", "D", "P"],
	PAY5001: ["R", "D", "D", "P"],
};
const MONTHLY_PATTERN = {
	"Workplace Safety Checklist": { EMP1001: "NC", EMP1002: "R", EMP1003: "D", EMP1004: "R", EMP1005: "P", EMP1006: "D", EMP1007: "NCX", EMP1008: "P", RO2001: "D", EMP1009: "R", HR3001: "P", PAY5001: "D" },
	"Data Privacy Declaration": { EMP1001: "P", EMP1002: "R", EMP1003: "D", EMP1004: "R", EMP1005: "D", EMP1006: "P", EMP1007: "R", EMP1008: "P", RO2001: "R", EMP1009: "D", HR3001: "R", PAY5001: "P" },
};

const fileJson = (name) => JSON.stringify({ fileName: name, fileUrl: SAMPLE_FILE_URL });
const iso = (m) => m.toISOString();

function snapshot(r) {
	return {
		selfAck: r.selfAck,
		selfAckOn: r.selfAckOn,
		selfExceptionalAck: r.selfExceptionalAck,
		selfExceptionalAckOn: r.selfExceptionalAckOn,
		roExceptionalAck: r.roExceptionalAck,
		roExceptionalStatus: r.roExceptionalStatus,
		roExceptionalAckOn: r.roExceptionalAckOn,
		roInput: r.roInput,
		roAck: r.roAck,
		roStatus: r.roStatus,
		roAckOn: r.roAckOn,
	};
}
const pushLog = (db, r) => {
	(db.logs[r.id] = db.logs[r.id] || []).push(snapshot(r));
};

function makeRecord(db, person, category, frequency, p, week, state) {
	const ro = personByCode(person.ro);
	const base = week ? week.start.clone() : p.start.clone().add(12, "days");
	const now = moment();
	const when = (days, h = 10) => iso(moment.min(base.clone().add(days, "days").hour(h).minute(20), now));
	const r = {
		id: db.nextId++,
		periodKey: p.key,
		globalCode: person.globalCode,
		name: person.name,
		category,
		frequency,
		week: week ? week.label : null,
		month: p.monthName,
		year: p.year,
		selfAck: false,
		selfStatus: null,
		selfEvidence: null,
		selfAckOn: null,
		roAck: false,
		roStatus: null,
		roInput: null,
		roAckOn: null,
		roGlobalCode: ro?.globalCode ?? "",
		roEmail: ro?.email ?? "",
		selfExceptionalAck: false,
		selfExceptionalEvidence: null,
		selfExceptionalAckOn: null,
		roExceptionalAck: false,
		roExceptionalStatus: null,
		roExceptionalEvidence: null,
		roExceptionalAckOn: null,
		locked: false,
		empLocked: false,
		sheet411: category === WEEKLY_CATEGORY ? `https://example.com/gps411/${person.globalCode}` : null,
	};
	if (state === "P") return r;

	const declare = () => {
		r.selfAck = true;
		r.selfStatus = "Declared";
		r.selfEvidence = fileJson(category.toLowerCase().replace(/ /g, "-") + "-evidence.pdf");
		r.selfAckOn = when(2);
	};
	if (state === "D") {
		declare();
		pushLog(db, r);
	} else if (state === "R") {
		declare();
		pushLog(db, r);
		r.roAck = true;
		r.roStatus = "Reviewed";
		r.roInput = "Verified. Evidence looks good.";
		r.roAckOn = when(3);
		pushLog(db, r);
	} else if (state === "L") {
		r.selfAck = true;
		r.selfStatus = "On Leave";
		r.selfAckOn = when(1);
		pushLog(db, r);
		r.roAck = true;
		r.roStatus = "Reviewed";
		r.roInput = "On approved leave.";
		r.roAckOn = when(2);
		pushLog(db, r);
	} else if (state === "SB") {
		declare();
		pushLog(db, r);
		r.selfAck = false;
		r.selfStatus = null;
		r.roAck = true;
		r.roStatus = "Send Back";
		r.roInput = "Evidence is unclear. Please re-upload the sheet.";
		r.roAckOn = when(3);
		pushLog(db, r);
	} else if (state === "NC" || state === "NCX") {
		declare();
		pushLog(db, r);
		r.selfAck = false;
		r.selfStatus = null;
		r.roAck = true;
		r.roStatus = "Non-Compliance";
		r.roInput = "Requirement not met for this period.";
		r.roAckOn = when(3);
		pushLog(db, r);
		if (state === "NCX") {
			r.selfExceptionalAck = true;
			r.selfExceptionalEvidence = fileJson("exception-justification.pdf");
			r.selfExceptionalAckOn = when(4);
			pushLog(db, r);
		}
	}
	return r;
}

function ensureMonth(db, p) {
	if (db.months[p.key]) return;
	db.months[p.key] = true;
	const isCurrent = p.key === currentPeriod().key;
	const started = p.weeks.filter((w) => w.start.isSameOrBefore(moment()));
	if (started.length === 0) return; // future payroll month: nothing yet
	PEOPLE.forEach((person) => {
		started.forEach((week, idx) => {
			const state = isCurrent ? (WEEKLY_PATTERN[person.globalCode] || [])[idx] || "P" : "R";
			db.records.push(makeRecord(db, person, WEEKLY_CATEGORY, "Weekly", p, week, state));
		});
		MONTHLY_CATEGORIES.forEach((cat) => {
			const state = isCurrent ? MONTHLY_PATTERN[cat][person.globalCode] || "P" : "R";
			db.records.push(makeRecord(db, person, cat, "Monthly", p, null, state));
		});
	});
}

const recordsFor = (db, p, predicate) => db.records.filter((r) => r.periodKey === p.key && predicate(r));
const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
const lc = (s) => String(s ?? "").toUpperCase();

/* --------------------------------------------------------------- RO view */
function buildRoView(db, roGc, type, dateStr) {
	const p = period(dateStr);
	ensureMonth(db, p);
	const team = PEOPLE.filter((x) => x.ro.toLowerCase() === String(roGc).toLowerCase());
	const teamCodes = team.map((x) => x.globalCode);
	const recs = recordsFor(db, p, (r) => teamCodes.includes(r.globalCode));
	const weekly = recs.filter((r) => r.frequency === "Weekly");
	const monthly = recs.filter((r) => r.frequency === "Monthly");

	const summary = {
		weekView: weekly.length > 0 ? 1 : 0,
		monthView: monthly.length > 0 ? MONTHLY_CATEGORIES.length : 0,
		weeklyPending: weekly.filter((r) => r.selfAck && !r.roAck).length,
		monthlyPending: monthly.filter((r) => r.selfAck && !r.roAck).length,
		nonCompliancePending: recs.filter((r) => lc(r.roStatus) === "NON-COMPLIANCE" && r.selfExceptionalAck && !r.roExceptionalAck).length,
	};
	const out = { summary, complianceCategoryWeeks: [], complianceCategory: [], employeeCompliances: [] };
	const counts = (rs) => ({
		PendingToDeclare: rs.filter((r) => !r.selfAck && (!r.roAck || lc(r.roStatus) === "SEND BACK")).length,
		PendingForReview: rs.filter((r) => r.selfAck && !r.roAck).length,
	});

	if (type === "Non-Compliance") {
		out.employeeCompliances = recs.filter((r) => lc(r.roStatus) === "NON-COMPLIANCE").map((r) => ({ ...r, name: r.name, globalCode: r.globalCode }));
	} else if (type === "Monthly") {
		if (monthly.length > 0) {
			out.complianceCategory = MONTHLY_CATEGORIES.map((c) => ({ category: c, frequency: "Monthly", year: p.year, month: p.monthName }));
		}
		out.employeeCompliances = team.map((person) => {
			const mine = monthly.filter((r) => r.globalCode === person.globalCode);
			const row = { Name: person.name, GlobalCode: person.globalCode, ...counts(mine) };
			mine.forEach((r) => (row[r.category] = r));
			return row;
		});
	} else {
		const weeks = [...new Set(weekly.map((r) => r.week))];
		if (weeks.length > 0) {
			out.complianceCategoryWeeks = [{ category: WEEKLY_CATEGORY, frequency: "Weekly", weeks: weeks.map((w) => ({ week: w })) }];
		}
		out.employeeCompliances = team.map((person) => {
			const mine = weekly.filter((r) => r.globalCode === person.globalCode);
			const row = { Name: person.name, GlobalCode: person.globalCode, ...counts(mine), [WEEKLY_CATEGORY]: {} };
			mine.forEach((r) => (row[WEEKLY_CATEGORY][r.week] = r));
			return row;
		});
	}
	return out;
}

/* ------------------------------------------------- HR / payroll sample data */
const FIRST = ["Aditya", "Bhavna", "Chetan", "Divya", "Eshaan", "Farhan", "Gauri", "Harsh", "Isha", "Jatin", "Kavya", "Lakshay", "Manya", "Nikhil", "Omkar", "Pooja"];
const LAST = ["Agarwal", "Bhatia", "Chopra", "Dutta", "Ghosh", "Iyer", "Jain", "Kulkarni", "Mishra", "Nambiar", "Oberoi", "Pillai", "Rastogi", "Saxena", "Trivedi", "Uppal"];
const LOCATIONS = ["Gurugram HQ", "Mumbai Plant", "Raipur Plant", "Bengaluru Tech Park"];
const DEPARTMENTS = ["Finance", "Human Resources", "IT", "Operations", "Procurement", "Sales", "Legal"];
const DESIGNATIONS = ["Manager", "Senior Executive", "Executive", "Assistant Manager", "Analyst", "Lead"];
const COMPANIES = ["Acme Industries Ltd", "Acme Power Ltd"];
const ORGS = ["Corporate Services", "Manufacturing", "Commercial"];

function genRows({ count, offset, prefix, isComplianced, year, month, roPool }) {
	return Array.from({ length: count }, (_, i) => {
		const n = offset + i;
		const name = `${FIRST[n % FIRST.length]} ${LAST[(n * 5 + 3) % LAST.length]}`;
		const ro = roPool[n % roPool.length];
		return {
			id: 9000 + n,
			globalCode: `${prefix}${3000 + n}`,
			empCode: `E${7000 + n}`,
			name,
			email: name.toLowerCase().replace(/ /g, ".") + "@example.com",
			orgName: ORGS[n % ORGS.length],
			company: COMPANIES[n % COMPANIES.length],
			location: LOCATIONS[n % LOCATIONS.length],
			department: DEPARTMENTS[(n * 3) % DEPARTMENTS.length],
			designation: DESIGNATIONS[n % DESIGNATIONS.length],
			cgGroup: "CG-" + "ABC"[n % 3],
			roEmail: ro.email,
			year,
			month,
			isComplianced,
			updatedOn: iso(moment().subtract(n % 6, "days").hour(9 + (n % 8)).minute((n * 7) % 60)),
		};
	});
}
const RO_POOL = [PEOPLE[8], PEOPLE[10], DIRECTOR, mkPerson("RO2002", "Manish Arora", "", "", "", ""), mkPerson("RO2003", "Pallavi Menon", "", "", "", "")];
const listSummary = (rows) => ({ totalEmployee: 148, nonCompliancedEmployee: rows.length, compliancedEmployee: 148 - rows.length });

function roSummaryRows(db, all) {
	const p = currentPeriod();
	ensureMonth(db, p);
	const team = PEOPLE.filter((x) => x.ro === "RO2001").map((x) => x.globalCode);
	const recs = recordsFor(db, p, (r) => team.includes(r.globalCode));
	const mine = {
		roGlobalCode: "RO2001",
		roEmail: personByCode("RO2001").email,
		totalReportee: team.length,
		reviewPendingOfReportee: new Set(recs.filter((r) => r.selfAck && !r.roAck).map((r) => r.globalCode)).size,
		noActionTakenByRO: recs.filter((r) => r.selfAck && !r.roAck).length,
		sendBackMarked: recs.filter((r) => lc(r.roStatus) === "SEND BACK").length,
		pendingCompliance: recs.filter((r) => !r.selfAck && !r.roAck).length,
		reviewedCompliance: recs.filter((r) => lc(r.roStatus) === "REVIEWED").length,
		nonComplianceMarked: recs.filter((r) => lc(r.roStatus) === "NON-COMPLIANCE").length,
	};
	const others = Array.from({ length: 11 }, (_, i) => {
		const total = 5 + ((i * 3) % 9);
		const reviewed = total * 2 + (i % 4);
		return {
			roGlobalCode: `RO${2002 + i}`,
			roEmail: `${FIRST[(i + 2) % 16]}.${LAST[(i * 3 + 1) % 16]}`.toLowerCase() + "@example.com",
			totalReportee: total,
			reviewPendingOfReportee: i % 5,
			noActionTakenByRO: (i * 2) % 7,
			sendBackMarked: i % 3,
			pendingCompliance: (i * 5) % 6,
			reviewedCompliance: reviewed,
			nonComplianceMarked: i % 4,
		};
	});
	const rows = [mine, ...others];
	return all ? rows : rows.filter((r) => r.reviewPendingOfReportee > 0 || r.nonComplianceMarked > 0 || r.noActionTakenByRO > 0);
}

function conditionsFor(body) {
	const gc = String(body?.GlobalCode ?? "X");
	const seed = [...gc].reduce((a, c) => a + c.charCodeAt(0), 0);
	const year = Number(body?.year) || moment().year();
	const month = body?.month || moment().format("MMMM");
	const rows = [
		{ category: WEEKLY_CATEGORY, frequency: "Weekly", week: period(moment(`${month} 15 ${year}`, "MMMM D YYYY")).weeks[seed % 3].label, year, month, roInput: "GPS411 evidence not submitted.", roStatus: "Non-Compliance", roAckOn: iso(moment().subtract(2, "days")) },
	];
	if (seed % 2 === 0) {
		rows.push({ category: MONTHLY_CATEGORIES[0], frequency: "Monthly", week: null, year, month, roInput: "Checklist incomplete.", roStatus: "Non-Compliance", roAckOn: iso(moment().subtract(1, "days")) });
	}
	return rows;
}

/* --------------------------------------------------------- background jobs */
function seedJobs() {
	const mk = (id, code, desc, daysAgo) => ({
		id,
		backgroundJobCode: code,
		backgroundJobDesc: desc,
		scheduledBy: "PAY5001",
		addedOn: iso(moment().subtract(daysAgo, "days").hour(18).minute(5)),
		startedOn: iso(moment().subtract(daysAgo, "days").hour(18).minute(6)),
		completedOn: iso(moment().subtract(daysAgo, "days").hour(18).minute(9)),
		updatedOn: iso(moment().subtract(daysAgo, "days").hour(18).minute(9)),
		isProcessed: true,
	});
	return [
		mk(3, "RunRORelease", "Run RO Release Program By Payroll Team", 20),
		mk(2, "RunEmployeeRelease", "Run Employee Release Program By Payroll Team", 20),
		mk(1, "RunEmployeeHold", "Run Employee Hold Program By Payroll Team", 24),
	];
}
function advanceJobs(db) {
	const now = moment();
	db.jobs.forEach((j) => {
		if (j.isProcessed === true) return;
		const age = now.diff(moment(j.addedOn), "seconds");
		if (age > 12) {
			j.isProcessed = true;
			j.startedOn = j.startedOn || iso(moment(j.addedOn).add(3, "seconds"));
			j.completedOn = iso(moment(j.addedOn).add(12, "seconds"));
			j.updatedOn = j.completedOn;
		} else if (age > 3) {
			j.isProcessed = false;
			j.startedOn = j.startedOn || iso(moment(j.addedOn).add(3, "seconds"));
			j.updatedOn = iso(now);
		}
	});
}

/* ------------------------------------------------------------------ router */
const parseBody = (b) => {
	if (typeof b === "string") {
		try {
			return JSON.parse(b);
		} catch (e) {
			return {};
		}
	}
	return b ?? {};
};

function handle(endpoint, options, db) {
	const [path, queryString] = endpoint.split("?");
	const query = new URLSearchParams(queryString || "");
	const method = (options.method || "GET").toUpperCase();
	const body = parseBody(options.body);
	const seg = path.split("/").filter(Boolean); // ["EmployeeDetail", "GetUser", "EMP1001"]
	const [controller, action, a1, a2, a3] = seg;
	const fail = (message) => ({ success: false, message });

	/* ----- authentication & profile ----- */
	if (controller === "EmployeeDetail") {
		if (action === "ValidateHrmsUser") {
			const key = String(body.username ?? "").trim().toLowerCase();
			const persona = PERSONAS[key] || Object.values(PERSONAS).find((x) => x.code.toLowerCase() === key);
			if (!persona) return { success: false, message: "Invalid login.", details: "Demo mode: use employee, ro, hr or payroll (any password) or the quick-login buttons." };
			return { success: true, message: "Login successful.", user: userPayload(personByCode(persona.code), persona.userRoles) };
		}
		if (action === "ValidateToken") return fail("Google sign-in is disabled in demo mode.");
		if (action === "GetUser") {
			const persona = Object.values(PERSONAS).find((x) => x.code.toLowerCase() === String(a1).toLowerCase());
			const person = personByCode(a1);
			if (!person) return fail("User not found.");
			return { success: true, user: userPayload(person, persona ? persona.userRoles : []) };
		}
	}

	/* ----- employee & RO compliance ----- */
	if (controller === "EmployeeCompliance") {
		if (action === "GetSelfCompliance" && method === "GET") {
			const p = period(a2);
			ensureMonth(db, p);
			const mine = recordsFor(db, p, (r) => r.globalCode.toLowerCase() === String(a1).toLowerCase());
			return [...mine.filter((r) => r.frequency === "Weekly"), ...mine.filter((r) => r.frequency === "Monthly")];
		}
		if (action === "GetROCompliance") return buildRoView(db, a1, a2, a3);

		const id = Number(query.get("employeeComplianceId") ?? body.id ?? body.Id);
		const rec = db.records.find((r) => r.id === id);
		const file = options.body && typeof options.body.get === "function" ? options.body.get("file") : null;
		const fileDetail = { fileName: file?.name || "evidence.pdf", fileUrl: file?.url || SAMPLE_FILE_URL };

		if (action === "UploadEvidece") {
			if (!rec) return fail("Record not found.");
			Object.assign(rec, { selfAck: true, selfStatus: "Declared", selfEvidence: JSON.stringify(fileDetail), selfAckOn: iso(moment()), roAck: false, roStatus: null, roAckOn: null });
			pushLog(db, rec);
			return { success: true, message: "Evidence uploaded and compliance declared.", fileDetail };
		}
		if (action === "UpdateSelfStatus") {
			if (!rec) return fail("Record not found.");
			Object.assign(rec, { selfAck: true, selfStatus: body.selfStatus || "Declared", selfAckOn: iso(moment()) });
			pushLog(db, rec);
			return { success: true, message: "Status updated." };
		}
		if (action === "UploadExceptionEvidece") {
			if (!rec) return fail("Record not found.");
			Object.assign(rec, { selfExceptionalAck: true, selfExceptionalEvidence: JSON.stringify(fileDetail), selfExceptionalAckOn: iso(moment()), roExceptionalAck: false, roExceptionalStatus: null });
			pushLog(db, rec);
			return { success: true, message: "Exception request sent to your RO.", fileDetail };
		}
		if (action === "UpdateROStatus") {
			if (!rec) return fail("Record not found.");
			const status = body.RoStatus;
			Object.assign(rec, { roAck: true, roStatus: status, roInput: body.RoInput ?? null, roAckOn: iso(moment()) });
			if (status === "Send Back" || status === "Non-Compliance") Object.assign(rec, { selfAck: false, selfStatus: null });
			pushLog(db, rec);
			return { success: true, message: `Status updated to "${status}".` };
		}
		if (action === "UploadExceptionEvideceByRO") {
			if (!rec) return fail("Record not found.");
			const status = query.get("roExceptionalStatus");
			Object.assign(rec, { roExceptionalAck: true, roExceptionalStatus: status, roExceptionalEvidence: JSON.stringify(fileDetail), roExceptionalAckOn: iso(moment()) });
			if (status === "Approved") Object.assign(rec, { selfAck: false, selfStatus: null });
			pushLog(db, rec);
			return { success: true, message: `Exception ${status === "Approved" ? "approved" : "rejected"}.`, fileDetail };
		}
		if (action === "GetComplianceLogs") {
			const rec2 = db.records.find(
				(r) =>
					r.globalCode === body.GlobalCode &&
					r.category === body.Category &&
					r.frequency === body.Frequency &&
					r.year === body.Year &&
					r.month === body.Month &&
					(r.week ?? null) === (body.Week ?? null)
			);
			return rec2 ? [...(db.logs[rec2.id] || [])].reverse() : [];
		}
		if (action === "GetPendingAtRO") return { success: true, complianceReport: roSummaryRows(db, a1 === "all") };
		if (action === "GetEmployeeNonComplianceConditions") return conditionsFor(body);
	}

	/* ----- HR & payroll reports ----- */
	if (controller === "EmployeeComplianceMonthlyFinal") {
		const cur = currentPeriod();
		const year = Number(body.year) || cur.year;
		const month = Number(body.month) || cur.monthNum;
		const emp = (count, offset, isComplianced) => genRows({ count, offset, prefix: "EMP", isComplianced, year, month, roPool: RO_POOL });
		const ros = (count, offset, isComplianced) => genRows({ count, offset, prefix: "RO", isComplianced, year, month, roPool: [DIRECTOR] });

		switch (action) {
			case "GetEmployeeComplianceLiveStatus": {
				const rows = emp(14, 0, false);
				return { success: true, summary: listSummary(rows), employees: rows };
			}
			case "GetEmployeeNonComplianceListByMonth": {
				const rows = emp(9, 0, false);
				return { success: true, summary: listSummary(rows), employees: rows };
			}
			case "GetEmployeeComplianceConversionsList": {
				const rows = emp(6, 20, true);
				return { success: true, summary: { totalEmployee: 148, nonCompliancedEmployee: 9, compliancedEmployee: rows.length }, employees: rows };
			}
			case "GetRONonComplianceListByMonth": {
				const rows = ros(5, 40, false);
				return { success: true, summary: listSummary(rows), employees: rows };
			}
			case "GetROComplianceConversionsList": {
				const rows = ros(3, 60, true);
				return { success: true, summary: { totalEmployee: 148, nonCompliancedEmployee: 5, compliancedEmployee: rows.length }, employees: rows };
			}
			default:
		}
	}

	if (controller === "BackgroundJobActionSchedule") {
		if (method === "POST") {
			const job = {
				id: (db.jobs.reduce((m, j) => Math.max(m, j.id), 0) || 0) + 1,
				backgroundJobCode: body.BackgroundJobCode,
				backgroundJobDesc: body.BackgroundJobDesc,
				scheduledBy: body.ScheduledBy,
				addedOn: iso(moment()),
				startedOn: null,
				completedOn: null,
				updatedOn: iso(moment()),
				isProcessed: null,
			};
			db.jobs.unshift(job);
			return job;
		}
		advanceJobs(db);
		return db.jobs;
	}

	console.warn("[demo mode] No mock for", method, endpoint);
	return fail(`Demo mode: endpoint not mocked (${endpoint})`);
}


const newDb = () => ({ nextId: 1000, months: {}, records: [], logs: {}, jobs: seedJobs() });

module.exports = { handle, newDb, clone, SAMPLE_FILE_URL };
