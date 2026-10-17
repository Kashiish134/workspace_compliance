import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { apiCall, getLocalApiUrl, isDemoMode, isSampleMode } from "../api/apiUtil";

const DEMO_LOGINS = [
	{ label: "Employee", code: "employee", variant: "primary" },
	{ label: "Reporting Officer", code: "ro", variant: "success" },
	{ label: "HR Head", code: "hr", variant: "info" },
	{ label: "Payroll", code: "payroll", variant: "warning" },
];

const LoginPage = () => {
	const [globalCode, setGlobalCode] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const login = (username, pwd) => {
		return apiCall("/EmployeeDetail/ValidateHrmsUser", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: username, password: pwd }),
		})
		.then((data) => {
			if (data.success) {
				sessionStorage.setItem("globalCode", data?.user?.globalCode);
				sessionStorage.setItem("userEmail", data?.user?.email);
				sessionStorage.setItem("userName", data?.user?.name);
				sessionStorage.setItem("roGlobalCode", data?.user?.roGlobalCode);
				sessionStorage.setItem("roEmail", data?.user?.roEmail);
				navigate("/user-dashboard"); // Navigate to dashboard using React Router
			} else {
				alert(data.message + " " + (data.details ?? ""));
			}
		})
		.catch((err) => {
			if (isSampleMode() && !isDemoMode()) {
				alert(`Cannot reach the local API at ${getLocalApiUrl()}.\nStart it with "npm run dev" (API + app) or "npm run server" (API only).`);
			} else {
				alert(err);
			}
			console.error("Error:", err);
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		login(globalCode, password);
	};

	return (
		<div className="login-container bg-dark">
			<form onSubmit={handleSubmit} className="login-form">
				<h4 className="text-white">Login To</h4>
				<h5>Workspace Compliance System</h5>
				<hr className="border-secondary my-3" />
				<div className="form-group text-white">
					<label htmlFor="email">IHRMYHR Global Code :</label>
					<input type="text" id="globalCode" value={globalCode} onChange={(e) => setGlobalCode(e.target.value)} placeholder="Enter Global Code" required />
				</div>
				<div className="form-group">
					<label htmlFor="password">IHRMYHR Password :</label>
					<input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
				</div>
				<button type="submit" className="login-button">
					Login
				</button> <br /><br />
				{isSampleMode() ? (
					<div className="form-group text-white text-center">
						<div className="small mb-2">{isDemoMode() ? "Demo mode (in-browser sample data). Sign in as:" : "Sample API mode. Sign in as:"}</div>
						<div className="d-flex flex-wrap justify-content-center gap-2">
							{DEMO_LOGINS.map((d) => (
								<button key={d.code} type="button" className={`btn btn-sm btn-${d.variant}`} onClick={() => login(d.code, "demo")}>
									{d.label}
								</button>
							))}
						</div>
						<div className="small mt-2 text-secondary">or type employee / ro / hr / payroll with any password</div>
					</div>
				) : (
					<div className="form-group">
						<div id="signInDiv" data-type="standard"></div>
					</div>
				)}
				<div className="d-flex justify-content-center mt-1">
					<a href="/WCS_User_Manual.pdf" target="_blank" className="btn btn-secondary me-2">User Manual</a>
					<a href="/faqs-page" target="_blank" className="btn btn-danger">FAQs</a>
				</div>
				<div className="d-flex justify-content-center mt-1">
					<a href="https://app.powerbi.com/groups/me/reports/f3109d4e-6498-4d20-89bd-8603e999e99b/f4d6e0ee91cbba1382d4?ctid=dceafa58-89d9-419f-8d1a-cc0295447f38&experience=power-bi" target="_blank" rel="noopener noreferrer" className="btn btn-success">Power BI Report</a>
				</div>
			</form>
		</div>
	);
};

export default LoginPage;
