import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import { Image, Button } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import logo2 from "../Images/logo2.png"; // Company Logo
import avtar from "../Images/avtar.png"; // Import Profile Picture
import "../App.css"; // Adjust path based on your structure

function NavbarComponent() {

	const [emailId, setEmailId] = useState(null);
	const [userName, setUserName] = useState(null);
	const [globalCode, setGlobalCode] = useState(null);
	const [roEmailId, setRoEmailId] = useState(null);
	const [roGlobalCode, setRoGlobalCode] = useState(null);

	const navigate = useNavigate();

	// Handle sign-out functionality
	const handleSignOut = () => {
		//window.google.accounts.id.disableAutoSelect();
		sessionStorage.clear(); // Clear session data
		setGlobalCode(null);
		navigate("/"); // Redirect to login page
		// window.location.reload();
	};

	useEffect(() => {
		//console.log("Global Code", sessionStorage.getItem("globalCode"));
		if(sessionStorage.getItem("globalCode") != null) {
			setGlobalCode(sessionStorage.getItem("globalCode"));
			setUserName(sessionStorage.getItem("userName"));
			setEmailId(sessionStorage.getItem("userEmail"));
			setRoEmailId(sessionStorage.getItem("roEmail"));
			setRoGlobalCode(sessionStorage.getItem("roGlobalCode"));
		}
	}, [navigate]);

	return (
		<div>
			{/* Overlay Navbar */}
			<Navbar
				expand="lg"
				className="navbar-overlay px-3 custom-navbar"
				style={{ margin: 0 }}
			>
				<div className="container-fluid">
					{/* Left-aligned logo */}
					<Navbar.Brand href="#home" className="me-auto">
						<Image src={logo2} alt="jspl" width={90} />
					</Navbar.Brand>

					{/* Right-aligned profile and Sign Out button */}
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					{(globalCode ?? "") !== "" && (
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="ms-auto d-flex align-items-center">
							{/* User Email (Optional, Hide on Small Screens) */}
							<span className="d-none d-sm-inline me-3 text-white">
								{userName} {(globalCode !== "NJ") && (<>({globalCode})</>)} <br />
								Reporting Officer - {roEmailId} ({roGlobalCode})
							</span>
							{/* Profile Picture */}
							<Image
								src={avtar}
								alt="Profile"
								roundedCircle
								width={40}
								height={40}
								className="profile-pic me-2"
							/>

							{/* Sign Out Button */}
							<Button variant="danger" size="sm" onClick={handleSignOut}>
								Sign Out
							</Button>
						</Nav>
					</Navbar.Collapse>
					)}
				</div>
			</Navbar>
		</div>
	);
}

export default NavbarComponent;
