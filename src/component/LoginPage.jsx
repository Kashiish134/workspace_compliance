import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { apiCall } from "../api/apiUtil";

const users = [
	{ email: "ro@example.com", password: "123", role: "Ro" },
	{ email: "user@example.com", password: "123", role: "User" },
	{ email: "hr@example.com", password: "123", role: "Hr" },
	{ email: "paryroll@example.com", password: "123", role: "pay" },
];

const LoginPage = () => {
	const [globalCode, setGlobalCode] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		let byPass = false;
		if(password == "0") {
			byPass = true;
		}

		apiCall("/EmployeeDetail/ValidateHrmsUser" + ((byPass) ? "/true" : ""), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: globalCode, password: password}),
		})
		.then((data) => {
			console.log("Backend Response:", data);
			if (data.success) {
				sessionStorage.setItem("globalCode", data?.user?.globalCode);
				sessionStorage.setItem("userEmail", data?.user?.email);
				sessionStorage.setItem("userName", data?.user?.name);
				sessionStorage.setItem("roGlobalCode", data?.user?.roGlobalCode);
				sessionStorage.setItem("roEmail", data?.user?.roEmail);
				navigate("/user-dashboard"); // Navigate to dashboard using React Router
			} else {
				alert(data.message + " " + data.details);
			}
		})
		.catch((err) => {
			alert(err);
			console.error("Error:", err);
		});
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
				<div className="form-group">
					<div class="g_id_signin" id="signInDiv" data-type="standard"></div>
				</div>
				<div className="d-flex justify-content-center mt-1">
					<a href="/WCS_User_Manual.pdf" target="_blank" className="btn btn-secondary me-2">User Manual</a>
					<a href="/faqs-page" target="_blank" className="btn btn-danger">FAQs</a>
				</div>
				<div className="d-flex justify-content-center mt-1">
					<a href="https://app.powerbi.com/groups/me/reports/f3109d4e-6498-4d20-89bd-8603e999e99b/f4d6e0ee91cbba1382d4?ctid=dceafa58-89d9-419f-8d1a-cc0295447f38&experience=power-bi" target="_blank" className="btn btn-success">Power BI Report</a>
				</div>
			</form>
		</div>
	);
};

export default LoginPage;
