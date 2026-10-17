import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {
	Row,
	Col,
	Button,
	Card,
	Table,
	Form,
	Container,
	Modal,
	Tabs,
	Tab,
} from "react-bootstrap";
import { FaTachometerAlt, FaCalendarAlt, FaUsers, FaUser, FaSpinner } from "react-icons/fa"; // Import Calendar Icon

import { apiCall } from "../api/apiUtil";

function Dashboard() {
	const [globalCode, setGlobalCode] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	const [complianceCount, setComplianceCount] = useState(0);
	const [completedCount, setCompletedCount] = useState(0);
	const [pendingCount, setPendingCount] = useState(0);
	const [pendingClarificationCount, setPendingClarificationCount] = useState(0);

	const [selectedTab, setSelectedTab] = useState("");
	const [declarationFlag, setDeclarationFlag] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const today = moment();
		// Get Current week's Monday
		const currentMonday = moment().startOf('week').add(1, 'day');
		// Get Current week's Sunday
		const currentSunday = moment(currentMonday).add(6, 'days'); // this Monday + 6 = Current Sunday
		// Build this month's 24th date
		const thisMonth24th = moment().date(24);
		const is24thInRange = thisMonth24th.isSameOrAfter(currentMonday, 'day') && thisMonth24th.isSameOrBefore(currentSunday, 'day');

		return (is24thInRange || today.date() > 23) ? today.add(10, "days").toDate() : today.toDate();
	});
	const [showModal, setShowModal] = useState(false);
	const [showDeclareModal, setShowDeclareModal] = useState(false);
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [showUserRequestModal, setShowUserRequestModal] = useState(false);

	const [modalTitle, setModalTitle] = useState("");
	const [modalContent, setModalContent] = useState("");

	// Categories List
	const [categories, setCategories] = useState([]);
	const [filterCategories, setFilterCategories] = useState([]);
	const [filterCategory, setFilterCategory] = useState(null);
	const [filterIndex, setFilterIndex] = useState(null);
	const [fileUploadingFlag, setFileUploadingFlag] = useState(false);
	
	const [, setHistoryData] = useState([]);
	
	const navigate = useNavigate();

	useEffect(() => {
		//console.log("Global Code", sessionStorage.getItem("globalCode"));
		let globalCode = sessionStorage.getItem("globalCode");
		if(globalCode) {
			setGlobalCode(sessionStorage.getItem("globalCode"));
			getRoles(globalCode);
		} else {
			navigate("/");
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [navigate]);

	useEffect(() => {
		//console.log("Global Code", sessionStorage.getItem("globalCode"));
		//let globalCode = sessionStorage.getItem("globalCode");
		if(globalCode) {
			setCategories([]);
			setFilterCategories([]);
			getSelfConditions(globalCode);
		}
		if(moment(selectedMonth).format("YYYY-MM") === moment(new Date()).format("YYYY-MM")) {
			//setDeclarationFlag(true);
		} else {
			setDeclarationFlag(false);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMonth]);

	useEffect(() => {
		//getSelfConditions(globalCode);
		if((categories ?? []).length > 0) {
			let filterCategories = categories?.filter((category) =>
				selectedTab === "Weekly" ? category.frequency === "Weekly"
				: selectedTab === "Monthly" ? category.frequency === "Monthly" : true
			);
			setFilterCategories(filterCategories);
		} else {
			setFilterCategories([]);
		}
	}, [selectedTab, categories]);

	const setCounters = (data) => {
		let total = data?.length;
		let completed = data.filter(ec => (ec.selfAck || (ec.roAck && ec.roStatus.toUpperCase() === "REVIEWED"))).length;
		let pendingClarification = data.filter(ec => (ec.roAck && ec.roStatus.toUpperCase() === "SEND BACK")).length;
		let pending = total - completed - pendingClarification;
		setComplianceCount(total);
		setCompletedCount(completed);
		setPendingClarificationCount(pendingClarification);
		setPendingCount(pending);
	}

	const getRoles = (globalCode) => {
		apiCall(`/EmployeeDetail/GetUser/${globalCode}` , {
			method: "GET"
		})
		.then((data) => {
			//console.log("Backend Response:", data);
			if (data.success) {
				sessionStorage.setItem("userRoles", JSON.stringify(data?.user?.userRoles));
				setUserRoles(data?.user?.userRoles);
				getSelfConditions(globalCode);
			}
		})
		.catch((err) => {
			alert(err);
			console.error("Error:", err);
		});
	};
	const getSelfConditions = (globalCode) => {
		apiCall(`/EmployeeCompliance/GetSelfCompliance/${globalCode}/${moment(selectedMonth).format("YYYY-MM-DD")}` , {
			method: "GET"
		})
		.then((data) => {
			//console.log("Backend Response:", data);
			setCategories(data ?? []);
			setFilterCategories([]);
			setCounters(data);
			if(data?.filter((category) => category.frequency === "Weekly").length > 0)
				setSelectedTab("Weekly");
			else if(data?.filter((category) => category.frequency === "Monthly").length > 0)
				setSelectedTab("Monthly");
			else setSelectedTab("");
			// if (data.success) {
			// 	sessionStorage.setItem("userRoles", data?.user?.userRoles);
			// }
		})
		.catch((err) => {
			alert(err);
			console.error("Error:", err);
		});
	};

	// Handle Checkbox Change

	// Handle File Upload
	const handleFileUpload = (event, index, category) => {
		const file = event.target.files[0];
		if(file != null) {
			uploadSelfEvidence(index, category, file);
		}
		//const updatedCategories = [...categories];
		//updatedCategories[index].selfEvidence = file;
		//setCategories(updatedCategories);
	};
	const uploadSelfEvidence = async(index, category, file) => {
		setFileUploadingFlag(true);
		const formData = new FormData();
		formData.append('file', file);
		const response = await apiCall("/EmployeeCompliance/UploadEvidece?employeeComplianceId=" + category?.id, {
			method: "POST",
			body: formData,
		});
		setFileUploadingFlag(false);
		if(response?.success) {
			const updatedCategories = [...filterCategories];
			updatedCategories[index].selfEvidence = JSON.stringify(response?.fileDetail);
			updatedCategories[index].selfAck = true;
			updatedCategories[index].roAck = null;
			setFilterCategories(updatedCategories);
			setCounters(categories);
		}
		alert(response?.message);
		setShowDeclareModal(false);
	}

	const handleUserExceptionRequest = (event, index, category) => {
		const file = event.target.files[0];
		if(file != null) {
			uploadUserExceptionRequest(index, category, file);
		}
	};
	const uploadUserExceptionRequest = async(index, category, file) => {
		setFileUploadingFlag(true);
		const formData = new FormData();
		formData.append('file', file);
		const response = await apiCall("/EmployeeCompliance/UploadExceptionEvidece?employeeComplianceId=" + category?.id, {
			method: "POST",
			body: formData,
		});
		setFileUploadingFlag(false);
		if(response?.success) {
			const updatedCategories = [...filterCategories];
			updatedCategories[index].selfExceptionalEvidence = JSON.stringify(response?.fileDetail);
			updatedCategories[index].selfExceptionalAck = true;
			updatedCategories[index].roExceptionalAck = null;
			setFilterCategories(updatedCategories);
			setCounters(categories);
		}
		alert(response?.message);
		setShowUserRequestModal(false);
	};

	const sendConfirmationToRO = async (event, sTab) => {
		event.preventDefault();
		
		//Send Confirmation mail to RO.
	};

	const handleShowModal = (index, category) => {
		setModalTitle(`Upload Evidence for ${category?.category}`);
		setModalContent(`Upload (evidence against the defined condition ${category?.category}.)`);
		setFilterCategory(category);
		setFilterIndex(index);
		setShowDeclareModal(true);
	};
	const handleUserRequestModal = (index, category) => {
		setModalTitle(`${category?.category} - ${(category?.week ?? category?.month + " - " + category?.year)}`);
		setModalContent(
		<>
			<p>Upload Exception Justification</p>
		</>);
		setFilterCategory(category);
		setFilterIndex(index);
		setShowUserRequestModal(true);
	};
	const handleViewDetails = (category) => {
		setModalTitle(`${category?.category} - ${(category?.week ?? category?.month + " - " + category?.year)}`);
		setModalContent(
			<>
				{((category?.roExceptionalAck ?? false) || (category?.selfExceptionalAck ?? false)) && (
					<>
						<h5>Exception Condition</h5>
						<Table striped bordered hover size="sm">
							<thead>
								<tr>
									<th>Exception Requested</th>
									<th>Self Exc. Evidence</th>
									<th>Exc. Requested On</th>
									<th>RO Exc. Review Status</th>
									<th>RO Exc. Evidence</th>
									<th>RO Exc. Reviewd On</th>
								</tr>
							</thead>
							<tbody>
								<td>{category?.selfExceptionalAck ? "Yes" : "-"}</td>
								<td>{category?.selfExceptionalEvidence != null ? (
									<a href={JSON.parse(category?.selfExceptionalEvidence ?? "{}")?.fileUrl ?? undefined} target="_blank" rel="noopener noreferrer">{"View File"}</a>
								) : (
									"-"
								)}
								</td>
								<td>{(category?.selfExceptionalAckOn != null) ? moment(category?.selfExceptionalAckOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
								<td>{category?.roExceptionalStatus ?? "Pending At RO"}</td>
								<td>{category?.roExceptionalEvidence != null ? (
									<a href={JSON.parse(category?.roExceptionalEvidence ?? "{}")?.fileUrl ?? undefined} target="_blank" rel="noopener noreferrer">{"View File"}</a>
								) : (
									"-"
								)}
								</td>
								<td>{(category?.roExceptionalAckOn != null) ? moment(category?.roExceptionalAckOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
							</tbody>
						</Table>						
						<h5>Normal Condition</h5>
					</>
				)}
				<Table striped bordered hover size="sm">
					<thead>
						<tr>
							<th>Self Declared</th>
							<th>Evidence</th>
							<th>Self Declared On</th>
							<th>RO Status</th>
							<th>RO Comments</th>
							<th>RO Reviewd On</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{category?.selfAck ? "Yes" : "-"}</td>
							<td>{category?.selfEvidence != null ? (
								<a href={JSON.parse(category?.selfEvidence ?? "{}")?.fileUrl ?? undefined} target="_blank" rel="noopener noreferrer">{"View File"}</a>
							) : (
								"-"
							)}
							</td>
							<td>{(category?.selfAckOn != null) ? moment(category?.selfAckOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
							<td>{category?.roStatus ?? "Pending"}</td>
							<td>{category?.roInput ?? "-"}</td>
							<td>{(category?.roAckOn != null) ? moment(category?.roAckOn).format("DD/MMM/YYYY HH:mm") : "Pending"}</td>													
						</tr>
					</tbody>
				</Table>
			</>			
		);
		setShowModal(true);
	};
	const handleHistoryModal = async (category) => {
		setHistoryData([]);
		setModalTitle(`History - ${category?.category} - ${(category?.week ?? category?.month + " - " + category?.year)}`);
		const employeeComplianceFilter = {
			"GlobalCode": category?.globalCode,
			"Category": category?.category,
			"Frequency": category?.frequency,
			"Year": category?.year,
			"Month": category?.month,
			"Week": category?.week,
		}
		let historyData = await apiCall("/EmployeeCompliance/GetComplianceLogs", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(employeeComplianceFilter),
		});
		setHistoryData(historyData);
		setModalContent(
			<>
				<Table striped bordered hover size="sm">
					<thead>
						<tr>
							<th>Self Declared</th>
							<th>Self Declared On</th>
							<th>Exception Requested On</th>
							<th>Exception Status</th>
							<th>Exception Reviewed On</th>
							<th>RO Comments</th>
							<th>RO Status</th>
							<th>RO Reviewed On</th>
						</tr>
					</thead>
					<tbody>
						{historyData.length > 0 ? (
						historyData.map((record, index) => (
							<tr key={index}>
								<td>{record.selfAck ? "Yes" : "No"}</td>
								<td>{(record?.selfAckOn != null) ? moment(record?.selfAckOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
								<td>{(record?.selfExceptionalAckOn != null) ? moment(record?.selfExceptionalAckOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
								<td>{(record?.selfExceptionalAck) && (record?.roExceptionalStatus ?? "Pending")}</td>
								<td>{(record?.roExceptionalAckOn != null) ? moment(record?.roExceptionalAckOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
								<td>{record.roInput ?? "-"}</td>
								<td>{(record?.selfAck) && (record.roStatus ?? "Pending")}</td>
								<td>{(record?.roAckOn != null) ? moment(record?.roAckOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
							</tr>
						))
						) : (
						<tr>
							<td colSpan="8" className="text-center text-muted">
								No history available
							</td>
						</tr>
						)}
					</tbody>
				</Table>
			</>
		);
		
		//get History Data API

		setShowHistoryModal(true);
	};

	return (
		<div className="d-flex flex-column min-vh-100">
			<Container className="flex-grow-1 mt-3 mb-3">
				<div className="row">
					<div className="col bg-light mb-2 d-flex justify-content-between align-items-center">
						<h5 className="mt-1">
							<FaTachometerAlt className="me-2" /> Employee Workspace Compliance Dashboard (Self)
						</h5>
						<div className="gap-2 ms-auto" style={{width: "250px"}}>
							<label className="align-items-center">Payroll Month</label>
							{/* Month Picker with Calendar Icon inside Input */}
							<div className="position-relative">
								<DatePicker selected={selectedMonth} onChange={(date) => setSelectedMonth(date)} dateFormat="MMMM yyyy" showMonthYearPicker className="form-control pe-5" />
								{/* Calendar Icon Inside Input */}
								<FaCalendarAlt className="position-absolute text-muted"
									style={{
										top: 20,
										right: "10px",
										transform: "translateY(-50%)",
										fontSize: "1.2rem",
										cursor: "pointer",
									}}
									onClick={() =>
										document
											.querySelector(".react-datepicker__input-container input")
											.focus()
									} // Trigger DatePicker on click
								/>
								<span style={{fontSize: "13px", color: "red"}}>24th of {moment(selectedMonth).subtract(1, "M").format("MMMM YYYY")} to 23rd of {moment(selectedMonth).format("MMMM YYYY")}</span>
							</div>
							{/* <Button variant="success" size="sm">
								Completed
							</Button> */}
						</div>
					</div>
				</div>

				<Row className="mb-2">
					<Col md={12} className="d-flex justify-content-end">
						<Button variant="primary" size="sm" className="me-2">
							Total Compliance{" "}
							<span className="badge bg-light text-dark ms-2">
								{complianceCount}
							</span>
						</Button>
						<Button variant="success" size="sm" className="me-2">
							Completed{" "}
							<span className="badge bg-light text-dark ms-2">
								{completedCount}
							</span>
						</Button>
						<Button variant="warning" size="sm" className="me-2">
							Pending For Declare{" "}
							<span className="badge bg-light text-dark ms-2">
								{pendingCount}
							</span>
						</Button>
						<Button variant="danger" size="sm" className="me-2">
							Asking Clarification{" "}
							<span className="badge bg-light text-dark ms-2">
								{pendingClarificationCount}
							</span>
						</Button>
						{Array.isArray(userRoles) && userRoles.some(role => role.role === "RO") && (
						<a href="/ro-dashboard" className="me-3">
							<Button variant="success" size="sm">
								<FaUsers className="me-2" /> Team Review
							</Button>
						</a>
						)}

						{Array.isArray(userRoles) && userRoles.some(role => role.role === "HR Head") && (
							<a href="/hr-dashboard" className="me-3">
								<Button variant="info" size="sm">
									<FaUser className="me-2" /> Location HR View
								</Button>
							</a>
						)}

						{Array.isArray(userRoles) && userRoles.some(role => role.role === "Payroll") && (
							<a href="/payroll-dashboard" className="me-3">
								<Button variant="info" size="sm">
									<FaUser className="me-2" /> Payroll View
								</Button>
							</a>
						)}

						{userRoles.some(role => role.role === "Admin") && (
							<a href="/admin-dashboard">
								<Button variant="info" size="sm">
									<FaUser className="me-2" /> Admin
								</Button>
							</a>
						)}
					</Col>
				</Row>

				<Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} className="mb-3">
					{(categories ?? []).length === 0 ? (<Tab eventKey="" title="No Content" />) : (<></>)}
					{(categories?.filter((category) => category.frequency === "Weekly").length > 0) ? (<Tab eventKey="Weekly" title="Weekly" />) : (<></>)}
					{(categories?.filter((category) => category.frequency === "Monthly").length > 0) ? (<Tab eventKey="Monthly" title="Monthly" />) : (<></>)}
				</Tabs>

				<Card>
					<Card.Body>
						<div className="table-responsive">
							<Table striped bordered hover className="mt-3">
								<thead>
									<tr>
										<th>Conditions</th>
										<th>Compliance Freqency</th>
										<th className="">RO Code & Email</th>
										<th className="text-center">Self Acknowledgement</th>
										<th className="text-center">RO Status</th>
										<th className="text-center">View Details</th>
									</tr>
								</thead>
								<tbody>
									{Array.isArray(filterCategories) && filterCategories.map((category, index) => (
										<tr key={index}>
											<td>
												{category?.category}
												{(category?.category?.toUpperCase() === "GPS411" && category?.sheet411 != null) && (
													<>
														<br />
														<a target="_blank" rel="noopener noreferrer" style={{cursor: "pointer"}} href={category?.sheet411 ?? undefined}>
															411 Sheet Link (Click Here)
														</a>
													</>
												)}
											</td>
											<td>
												{category?.frequency} <br />
												{((category?.frequency === "Weekly") ? category?.week : "")}
												{((category?.frequency === "Monthly") ? category?.year + " - " + category?.month : "")}
											</td>
											<td>
												{category?.roGlobalCode ?? ""}<br />
												{category?.roEmail ?? ""}
											</td>
											<td className="text-center">
												{(((category?.selfAck ?? false) && (!(category?.roAck ?? false))) || (category?.roAck && category?.roStatus.toUpperCase() === "REVIEWED")) && 
													<Button variant="success" size="sm" style={{width: 150}}>{category?.selfStatus ?? "Declared"}</Button>
												}
												{(!(category?.empLocked ?? false) && !(category?.selfAck ?? false) && !(category?.roAck ?? false)) &&
													<Button variant="warning" size="sm" style={{width: 150}} onClick={() => handleShowModal(index, category)}>
														Pending to Declare
													</Button>
												}
												{(!(category?.empLocked ?? false) && !(category?.selfAck ?? false) && (category?.roAck ?? false) && category?.roStatus.toUpperCase() === "SEND BACK") &&
													<Button variant="warning" size="sm" style={{width: 150}} onClick={() => handleShowModal(index, category)}>
														Pending to Declare
													</Button>
												}
												{((!(category?.locked ?? false) && !(category?.selfAck ?? false)) && (category?.roAck && category?.roStatus.toUpperCase() === "NON-COMPLIANCE") && (category?.roExceptionalAck && category?.roExceptionalStatus?.toUpperCase() === "APPROVED")) &&
													<Button variant="warning" size="sm" style={{width: 150}} onClick={() => handleShowModal(index, category)}>
														Pending to Declare
													</Button>
												}
												{/* {(!(category?.locked ?? false) && !(category?.selfAck ?? false)) && } */}
												{((category?.roAck ?? false) && (category?.roStatus?.toUpperCase() === "NON-COMPLIANCE") && !(category?.selfExceptionalAck ?? false) && !(category?.roExceptionalAck ?? false)) &&
													<Button variant="warning" size="sm" style={{width: 150}} onClick={() => handleUserRequestModal(index, category)}>
														Request
													</Button>
												}
												{((!(category?.locked ?? false) && !(category?.selfAck ?? false)) && (category?.roAck ?? false) && (category?.roStatus?.toUpperCase() === "NON-COMPLIANCE") && (category?.selfExceptionalAck ?? false) && !(category?.roExceptionalAck ?? false)) &&
													<Button variant="info" size="sm" style={{width: 150}}>
														Request In Review
													</Button>
												}
												{((!(category?.locked ?? false) && !(category?.selfAck ?? false)) && (category?.roAck ?? false) && (category?.roStatus?.toUpperCase() === "NON-COMPLIANCE") && (category?.roExceptionalAck && category?.roExceptionalStatus?.toUpperCase() === "REJECTED")) &&
													<Button variant="danger" size="sm" style={{width: 150}}>
														Request Rejected
													</Button>
												}
											</td>
											<td className="text-center">
												{((category?.selfAck ?? false) && !(category?.roAck ?? false)) && (
													<Button variant="info" size="sm" style={{width: 150}}>REVIEW PENDING</Button>
												)}
												{((category?.roAck && category?.roStatus.toUpperCase() === "REVIEWED")) && (
													<Button variant="success" size="sm" style={{width: 150}}>REVIEWED BY RO</Button>
												)}
												{((category?.roAck && category?.roStatus.toUpperCase() === "SEND BACK")) && (
													<Button variant="warning" size="sm" style={{width: 150}}>REVERTED BY RO</Button>
												)}
												{((category?.roAck && category?.roStatus.toUpperCase() === "NON-COMPLIANCE")) && (
													<Button variant="danger" size="sm" style={{width: 150}}>NON-COMPLIANCE</Button>
												)}
											</td>
											<td className="text-center">
												<Button size="sm" onClick={() => handleViewDetails(category)} style={{width: 80}}>View</Button>&nbsp;
												<Button variant="secondary" size="sm" onClick={() => handleHistoryModal(category)} style={{width: 80}}>History</Button>
											</td>
										</tr>
									))}
									{(Array.isArray(filterCategories) && filterCategories.length === 0) && 
										(
											<tr>
											  <td colSpan="6" className="text-center text-muted">
												No records found
											  </td>
											</tr>
										)
									}
								</tbody>
							</Table>
							{(declarationFlag) && (								
								<form onSubmit={(event) => {sendConfirmationToRO(event, selectedTab)}}>
									<p className="text-center pfont d-flex align-items-center">
										<Form.Check type="checkbox" id="declareCompliance" className="ms-2 mt-1"
											 disabled = {!filterCategories.every(
												(ec) => ec.selfAck === true || (ec?.roStatus ?? "").toUpperCase() === "REVIEWED"
											  )} required />&nbsp;
										<span style={{ fontSize: "0.875rem" }}>
											I declare that all the compliances for {(selectedTab === "Weekly") ? "current week of" : "" } {moment(selectedMonth).format("MMMM YYYY")} stands updated.
										</span>&nbsp; &nbsp;
										<Button size="sm" variant="success" type="submit" 
											disabled = {!filterCategories.every(
												(ec) => ec.selfAck === true || (ec?.roStatus ?? "").toUpperCase() === "REVIEWED"
											  )}>{(selectedTab === "Weekly") ? "Send Weekly Update to RO For Review" : "Send Monthly Update to RO For Review"}</Button>
									</p>
									<p className="text-center pfont d-flex align-items-center">
										<span style={{ fontSize: "0.875rem" }}>
											<b>PLEASE NOTE:</b> You can send to RO for review post self declaration against all conditions for {(selectedTab === "Weekly") ? "current week of " : ""} {moment(selectedMonth).format("MMMM YYYY")}.
										</span>
									</p>
							  </form>
							)}
							<div className="pfont d-flex align-items-start">
								<span style={{ fontSize: "0.875rem" }}>
									<b>PLEASE NOTE:</b> <br />
									<ol>
										<li>Individuals 411 Status auto synchronization occurs three times a day.
											<ol type="i">
												<li>If 411 done before 3 AM then it will be auto declared by 9 AM at the latest.</li>
												<li>If 411 done before 11 AM then it will be auto declared by 5 PM at the latest.</li>
												<li>If 411 done before 6 PM then it will be auto declared by 12 midnight at the latest.</li>
											</ol>
										</li>
										<li>All conditions for the payroll month, which runs from 24th of {moment(selectedMonth).subtract(1, "M").format("MMMM YYYY")} to 23rd of {moment(selectedMonth).format("MMMM YYYY")}</li>
										<li>If the day 23rd falls in the middle of the week, the entire week (Monday to Sunday) will be considered part of the following month</li>
										<li>If the auto-sync does not function properly as per the defined schedule and you receive continuous reminders from the gps411 mail ID you can follow the steps below:
											<ol type="i">
												<li>Ensure that you have updated (textual changes) in your weekly priorities.</li>
												<li>If the above steps also fails, then as a last resort, please upload the weekly spreadsheet manually as supporting evidence.</li>
											</ol>
										</li>
										<li>For Basic support use the <a href="/faqs-page" target="_blank" rel="noopener noreferrer">FAQ section</a> in the portal or visit <a href="https://jsplconnect.jindalsteel.com/gps411.html" target="_blank" rel="noopener noreferrer">https://jsplconnect.jindalsteel.com/gps411.html</a></li>
									</ol>
								</span>
							</div>
						</div>
					</Card.Body>

					{/* Back Button with Right Arrow Icon */}
					{/* <Card.Footer className="d-flex justify-content-end">
						<a href="/payroll-dashboard">
							<Button variant="secondary" size="sm">
								Back <FaArrowRight className="ms-2" />
							</Button>
						</a>
					</Card.Footer> */}
				</Card>

				{/* Modal Component */}
				<Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
					<Modal.Header closeButton>
						<Modal.Title>{modalTitle}</Modal.Title>
					</Modal.Header>
					<Modal.Body>{modalContent}</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowModal(false)}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
				<Modal show={showDeclareModal} onHide={() => setShowDeclareModal(false)}>
					<Modal.Header closeButton>
						<Modal.Title>{modalTitle}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{modalContent}<br /><br />
						<Form.Group controlId="formFile" className="mb-3">
							{/* <Form.Label>Upload Evidence (Evidence will be auto uploaded.)</Form.Label> */}
							<Form.Control type="file" onChange={(event) => handleFileUpload(event, filterIndex, filterCategory)} />
						</Form.Group>
					</Modal.Body>
					<Modal.Footer className="justify-content-start">
						{(fileUploadingFlag && (<><FaSpinner className="me-2 spinner" /><span> File uploading inprogress. Please wait ...</span></>))}
					</Modal.Footer>
				</Modal>
				<Modal show={showUserRequestModal} onHide={() => setShowUserRequestModal(false)}>
					<Modal.Header closeButton>
						<Modal.Title>{modalTitle}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{modalContent}
						<Form.Group controlId="formFile" className="mb-3">
							{/* <Form.Label>Upload Evidence (Evidence will be auto uploaded.)</Form.Label> */}
							<Form.Control type="file" onChange={(event) => handleUserExceptionRequest(event, filterIndex, filterCategory)} />
						</Form.Group>
					</Modal.Body>
					<Modal.Footer className="justify-content-start">
						{(fileUploadingFlag && (<><FaSpinner className="me-2 spinner" /><span> File uploading inprogress. Please wait ...</span></>))}
					</Modal.Footer>
				</Modal>
				<Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="xl">
					<Modal.Header closeButton>
						<Modal.Title>{modalTitle}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{modalContent}
					</Modal.Body>
				</Modal>
			</Container>
		</div>
	);
}

export default Dashboard;
