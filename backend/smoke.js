/* End-to-end smoke test for the API: node backend/smoke.js (needs Node 18+ for fetch/FormData). */
const os = require("os");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { createApp } = require("./server");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wcs-"));
const { app } = createApp({ dataDir: path.join(tmp, "data"), uploadDir: path.join(tmp, "uploads") });

const json = (o) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });
const put = (o) => ({ method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });
const today = new Date().toISOString().slice(0, 10);
let passed = 0;
const step = async (name, fn) => {
	await fn();
	passed++;
	console.log("  ok  " + name);
};

const server = app.listen(0, async () => {
	const base = `http://localhost:${server.address().port}/api`;
	const call = (p, o) => fetch(base + p, o).then((r) => r.json());
	try {
		await step("health", async () => assert.strictEqual((await call("/health")).status, "ok"));

		await step("login: wrong user rejected, personas accepted", async () => {
			assert.strictEqual((await call("/EmployeeDetail/ValidateHrmsUser", json({ username: "nobody", password: "x" }))).success, false);
			for (const u of ["employee", "ro", "hr", "payroll"]) {
				const d = await call("/EmployeeDetail/ValidateHrmsUser", json({ username: u, password: "x" }));
				assert.ok(d.success && d.user.globalCode, u);
			}
			const hr = await call("/EmployeeDetail/GetUser/HR3001");
			assert.deepStrictEqual(hr.user.userRoles.map((r) => r.role), ["RO", "HR Head"]);
		});

		let self;
		await step("employee sees 4 weekly + 2 monthly records", async () => {
			self = await call(`/EmployeeCompliance/GetSelfCompliance/EMP1001/${today}`);
			assert.strictEqual(self.filter((r) => r.frequency === "Weekly").length, 4);
			assert.strictEqual(self.filter((r) => r.frequency === "Monthly").length, 2);
		});

		const pending = () => self.find((r) => r.frequency === "Weekly" && !r.selfAck && !r.roAck);
		await step("employee uploads evidence (multipart) and the file is served", async () => {
			const rec = pending();
			assert.ok(rec, "a pending weekly record exists");
			const fd = new FormData();
			fd.append("file", new Blob(["evidence bytes"], { type: "text/plain" }), "my evidence.txt");
			const res = await call(`/EmployeeCompliance/UploadEvidece?employeeComplianceId=${rec.id}`, { method: "POST", body: fd });
			assert.ok(res.success, JSON.stringify(res));
			assert.strictEqual(res.fileDetail.fileName, "my evidence.txt");
			const served = await fetch(res.fileDetail.fileUrl);
			assert.strictEqual(served.status, 200);
			assert.strictEqual(await served.text(), "evidence bytes");
			rec.uploadedId = rec.id;
		});

		const targetId = () => self.find((r) => r.frequency === "Weekly" && !r.selfAck && !r.roAck).id;
		await step("RO sees it pending review and marks it Reviewed", async () => {
			const id = self.find((r) => r.frequency === "Weekly" && !r.selfAck && !r.roAck).id;
			const ro = await call(`/EmployeeCompliance/GetROCompliance/RO2001/Weekly/${today}`);
			const row = ro.employeeCompliances.find((e) => e.GlobalCode === "EMP1001");
			const cell = Object.values(row.GPS411).find((c) => c.id === id);
			assert.ok(cell.selfAck && !cell.roAck, "declared, awaiting RO");
			const upd = await call("/EmployeeCompliance/UpdateROStatus", put({ Id: id, RoStatus: "Reviewed", RoInput: "ok", RoAck: true }));
			assert.ok(upd.success);
			const after = await call(`/EmployeeCompliance/GetSelfCompliance/EMP1001/${today}`);
			assert.strictEqual(after.find((r) => r.id === id).roStatus, "Reviewed");
			const logs = await call("/EmployeeCompliance/GetComplianceLogs", json({ GlobalCode: "EMP1001", Category: "GPS411", Frequency: "Weekly", Year: after[0].year, Month: after[0].month, Week: after.find((r) => r.id === id).week }));
			assert.ok(logs.length >= 2, "history has declare + review entries");
		});

		await step("exception flow: request, RO approves, employee can re-declare", async () => {
			const nc = (await call(`/EmployeeCompliance/GetSelfCompliance/EMP1001/${today}`)).find((r) => r.roStatus === "Non-Compliance");
			const fd = new FormData();
			fd.append("file", new Blob(["why"]), "justification.txt");
			assert.ok((await call(`/EmployeeCompliance/UploadExceptionEvidece?employeeComplianceId=${nc.id}`, { method: "POST", body: fd })).success);
			const ncList = await call(`/EmployeeCompliance/GetROCompliance/RO2001/Non-Compliance/${today}`);
			assert.ok(ncList.employeeCompliances.some((r) => r.id === nc.id && r.selfExceptionalAck));
			const fd2 = new FormData();
			fd2.append("file", new Blob(["approved"]), "approval.txt");
			assert.ok((await call(`/EmployeeCompliance/UploadExceptionEvideceByRO?employeeComplianceId=${nc.id}&roExceptionalStatus=Approved`, { method: "POST", body: fd2 })).success);
			const after = (await call(`/EmployeeCompliance/GetSelfCompliance/EMP1001/${today}`)).find((r) => r.id === nc.id);
			assert.ok(after.roExceptionalAck && after.roExceptionalStatus === "Approved" && !after.selfAck);
		});

		await step("HR reports and RO summary reflect live data", async () => {
			const live = await call("/EmployeeComplianceMonthlyFinal/GetEmployeeComplianceLiveStatus", json({ year: 2026, month: 10 }));
			assert.ok(live.success && live.employees.length === 14 && live.summary.totalEmployee === 148);
			const ros = await call("/EmployeeCompliance/GetPendingAtRO/all", json({}));
			const mine = ros.complianceReport.find((r) => r.roGlobalCode === "RO2001");
			assert.strictEqual(mine.totalReportee, 8);
			const cond = await call("/EmployeeCompliance/GetEmployeeNonComplianceConditions", json({ GlobalCode: "EMP3000", year: 2026, month: "October" }));
			assert.ok(cond.length >= 1);
		});

		await step("payroll schedules a job, history lists it, and data persists to disk", async () => {
			const job = await call("/BackgroundJobActionSchedule", json({ BackgroundJobCode: "RunEmployeeHold", BackgroundJobDesc: "Run Employee Hold Program By Payroll Team", ScheduledBy: "PAY5001" }));
			assert.ok(job.id);
			const list = await call("/BackgroundJobActionSchedule");
			assert.ok(list.length >= 4 && list[0].id === job.id);
			await new Promise((r) => setTimeout(r, 400));
			assert.ok(fs.existsSync(path.join(tmp, "data", "db.json")));
		});

		await step("reset restores the original data", async () => {
			assert.ok((await call("/reset", { method: "POST" })).success);
			const list = await call("/BackgroundJobActionSchedule");
			assert.strictEqual(list.length, 3);
		});

		console.log(`\nAll ${passed} API checks passed.`);
		server.close();
		fs.rmSync(tmp, { recursive: true, force: true });
	} catch (err) {
		console.error("\nFAILED:", err.message);
		server.close();
		process.exit(1);
	}
});
