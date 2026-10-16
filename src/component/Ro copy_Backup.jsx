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
	Badge,
	Tooltip,
	OverlayTrigger, Tabs, Tab
} from "react-bootstrap";
import { FaTachometerAlt, FaCheck, FaUser, FaCalendarAlt, FaInfoCircle, FaPaperPlane, FaReply, FaExternalLinkAlt } from "react-icons/fa";
import { FaCircleStop, FaCloudArrowDown, FaHand, FaBan} from "react-icons/fa6";
import { apiCall } from "../api/apiUtil";

function Ro() {
	const [globalCode, setGlobalCode] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	const [totalEmployeeCount, setTotalEmployeeCount] = useState(0);
	const [pendingForSelfDeclare, setPendingForSelfDeclare] = useState(0);
	const [pendingForSelfReview, setPendingForReview] = useState(0);
	const [selectedMonth, setSelectedMonth] = useState(new Date());

	const [selectedTab, setSelectedTab] = useState(null);
	// Define dynamic table data
	const [employeeCompliances, setEmployeeCompliances] = useState([]);

	// Define state for dropdown selection
	const [selectedRoData, setSelectedRoData] = useState(
		//tableData.reduce((acc, item) => ({ ...acc, [item.id]: "Pending" }), {})
	);

	const [complianceCategories, setComplianceCategories] = useState([
		{
            "category": "Category-1",
            "frequency": "Weekly",
            "year": "2025",
            "month": "January",
            "week": "26-Jan-2025 - 01-Feb-2025"
        },
        {
            "category": "Category-2",
            "frequency": "Monthly",
            "year": "2025",
            "month": "February"
        },
        {
            "category": "Category-3",
            "frequency": "Monthly",
            "year": "2025",
            "month": "February"
        },
        {
            "category": "Category-6",
            "frequency": "Monthly",
            "year": "2025",
            "month": "February"
        },
        {
            "category": "Category-7",
            "frequency": "Monthly",
            "year": "2025",
            "month": "February"
        }
	]);
	const [employeeComplianceUpdateIndex, setEmployeeComplianceUpdateIndex] = useState(null);
	const [employeeComplianceId, setEmployeeComplianceId] = useState(null);
	const [employeeComplianceROInput, setEmployeeComplianceROInput] = useState(null);
	const [employeeComplianceROStatus, setEmployeeComplianceROStatus] = useState(null);

	// Modal State
	const [showModal, setShowModal] = useState(false);
	const [modalTitle, setModalTitle] = useState("");
	const [modalContent, setModalContent] = useState("");

	const [showROActionModal, setShowROActionModal] = useState(false);
		
	const navigate = useNavigate();

	useEffect(() => {
		//console.log("Global Code", sessionStorage.getItem("globalCode"));
		let globalCode = sessionStorage.getItem("globalCode");
		if(globalCode) {
			setGlobalCode(globalCode);
			setUserRoles(JSON.parse(sessionStorage.getItem("userRoles")));
			setSelectedTab("Weekly");
		}
	}, [navigate]);

	useEffect(() => {		
		if(globalCode) {
			getROCompliance(globalCode, selectedTab);
		}
	}, [selectedTab, selectedMonth]);

	const getROCompliance = (globalCode, type) => {
		apiCall(`/EmployeeCompliance/GetROCompliance/${globalCode}/${type}/${moment(selectedMonth).format("YYYY-MM-DD")}` , {
			method: "GET"
		})
		.then((data) => {
			console.log("Backend Response:", data);
			setComplianceCategories(data.complainceCategory);
			setEmployeeCompliances(updateEmployeeWiseActionPending(data.employeeCompliances));
			setCounters(data.employeeCompliances);
			// if (data.success) {
			// 	sessionStorage.setItem("userRoles", data?.user?.userRoles);
			// }
		})
		.catch((err) => {
			alert(err);
			console.error("Error:", err);
		});
	};

	const setCounters = (data) => {
		let total = data?.length;
		let pendingForSelfDeclare = data?.filter(ec => (!ec.selfAck || ((ec.roAck && ec.roStatus.toUpperCase() === "SEND BACK")))).length;
		let pendingForReview = total - pendingForSelfDeclare;
		// let completed = data.filter(ec => (ec.selfAck || (ec.roAck && ec.roStatus.toUpperCase() === "APPROVED"))).length;
		// let pendingClarification = data.filter(ec => (ec.roAck && ec.roStatus.toUpperCase() === "SEND BACK")).length;
		//let pending = total - completed - pendingClarification;
		setTotalEmployeeCount(total);
		setPendingForSelfDeclare(pendingForSelfDeclare);
		setPendingForReview(pendingForReview);
		//setPendingCount(pending);
	}

	const updateEmployeeWiseActionPending = (data) => {
		return data.map((employee) => {
			let selfActionPending = 0;
			let roActionPending = 0;
			
			let empData = { ...employee };
			// Iterate over each category dynamically
			Object.keys(employee).forEach((key) => {
				if (typeof employee[key] === "object" && employee[key] !== null) {
					if ((!(employee[key]?.selfAck ?? false) && !(employee[key]?.roAck ?? false))
						|| (!(employee[key]?.selfAck ?? false) && (employee[key]?.roAck ?? false)) && (employee[key]?.roStatus?.toUpperCase() === "SEND BACK")) selfActionPending++;
					if (!(employee[key]?.roAck ?? false)) roActionPending++;
				}
			});
			empData.selfActionPending = selfActionPending;
			empData.roActionPending = roActionPending;
			
			return empData;
		});
		// console.log("---------------------------Sucesss----------------------------------------");
		// console.log(JSON.stringify(transformData, null, "\t"));
		//return transformData;
	};

	// Handle dropdown change
	const handleDropdownChange = (id, value) => {
		setSelectedRoData((prev) => ({
			...prev,
			[id]: value,
		}));
	};
	// Function to handle modal opening
	const handleShowModal = (title, content) => {
		setModalTitle(title);
		setModalContent(content);
		setShowModal(true);
	};

	// Modify the function to handle RO comments modal
	const handleShowRoComments = (name, comment) => {
		setModalTitle(`RO Comments - ${name}`);
		setModalContent(comment);
		setShowModal(true);
	};
	
	const handleROAction = (eIndex, cIndex, employeeComplianceId) => {
		let updatedEmployeeComplianceUpdateIndex = {};
		updatedEmployeeComplianceUpdateIndex.eIndex = eIndex;
		updatedEmployeeComplianceUpdateIndex.cIndex = cIndex;
				
		setEmployeeComplianceUpdateIndex(updatedEmployeeComplianceUpdateIndex);
		setEmployeeComplianceId(employeeComplianceId);
		setShowROActionModal(true);
	}
	const updateROStatus = async (event) => {
		event.preventDefault();

		let empComplaince = {
			Id: employeeComplianceId,
			RoInput: employeeComplianceROInput,
			RoStatus: employeeComplianceROStatus,
			RoAck: true
		};
		apiCall("/EmployeeCompliance/UpdateROStatus", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(empComplaince),
        })
        .then((data) => {
            //console.log("Backend Response:", data);
            if (data.success) {
				alert(data.message);
				setShowROActionModal(false);

				let updatedEmployeeCompliances = [...employeeCompliances];
				updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex][employeeComplianceUpdateIndex?.cIndex].roStatus = employeeComplianceROStatus;
				updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex][employeeComplianceUpdateIndex?.cIndex].roAck = true;
				setEmployeeCompliances(updateEmployeeWiseActionPending(updatedEmployeeCompliances));
				// if(updatedEmployeeCompliances.length > 0) {
					
				// }
            } else {				
				alert(data.message);
			}
        })
        .catch((err) => {
            alert(err);
            console.error("Error:", err);
        });
	}

	return (
		<div className="d-flex flex-column min-vh-100">
			<Container className="flex-grow-1 mt-3 mb-3">
				<div className="row"></div>
					<div className="col bg-light mb-2 d-flex justify-content-between align-items-center">
						{/* Dashboard Title with Icon */}
						<h5 className="mb-3">
							<FaTachometerAlt className="me-2" /> RO Dashboard
						</h5>
						<div className="d-flex gap-2 ms-auto mb-2">
							{/* Month Picker with Calendar Icon inside Input */}
							<div className="position-relative">
								<DatePicker
									selected={selectedMonth}
									onChange={(date) => setSelectedMonth(date)}
									dateFormat="MMMM yyyy"
									showMonthYearPicker
									className="form-control pe-5" // Add padding for icon spacing
								/>
								{/* Calendar Icon Inside Input */}
								<FaCalendarAlt
									className="position-absolute text-muted"
									style={{
										top: "50%",
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
							</div>
					</div>
				</div>
				{/* Buttons */}
				<Row className="mb-3">
					<Col md={12} className="d-flex justify-content-end">
						<Button variant="primary" size="sm" className="me-2" >
							Total Reportee{" "}
							<span className="badge bg-light text-dark ms-2">
								{totalEmployeeCount}
							</span>
						</Button>
						<Button variant="info" size="sm" className="me-2">
							Not Declared Yet{" "}
							<span className="badge bg-light text-dark ms-2">
								{pendingForSelfDeclare}
							</span>
						</Button>
						<Button variant="warning" size="sm" className="me-2">
							Review Pending{" "}
							<span className="badge bg-light text-dark ms-2">
								{pendingForSelfReview}
							</span>
						</Button>

						<a href="/user-dashboard" className="me-3">
							<Button variant="success" size="sm">
								<FaUser className="me-2" /> Self Review
							</Button>
						</a>

						{Array.isArray(userRoles) && userRoles?.some(role => role.role === "HR Head") && (
							<a href="/hr-dashboard" className="me-3">
								<Button variant="info" size="sm">
									<FaUser className="me-2" /> Location HR View
								</Button>
							</a>
						)}

						{Array.isArray(userRoles) && userRoles?.some(role => role.role === "Payroll") && (
							<a href="/payroll-dashboard" className="me-3">
								<Button variant="info" size="sm">
									<FaUser className="me-2" /> Payroll View
								</Button>
							</a>
						)}

						{Array.isArray(userRoles) && userRoles?.some(role => role.role === "Admin") && (
							<a href="/admin-dashboard">
								<Button variant="info" size="sm">
									<FaUser className="me-2" /> Admin
								</Button>
							</a>
						)}
					</Col>
				</Row>

				<Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} className="mb-3" >
					<Tab eventKey="Weekly" title="Weekly" />
					<Tab eventKey="Monthly" title="Monthly" />
					<Tab eventKey="Non-Compliance" title="Non-Compliance" />
				</Tabs>

				{(selectedTab == "Weekly") && (
				<Card>
					<Card.Body>
						
					</Card.Body>
				</Card>
				)}
				{(selectedTab == "Monthly") && (
				<Card>
					<Card.Body>
						{/* Responsive Table */}
						<div className="table-responsive" style={{ overflowX: "auto", maxHeight: "500px" }}>
							<Table striped bordered hover className="mt-1">
								<thead>
									<tr>
										{/* <th style={{ backgroundColor: "#6e6c6c", color: "#fff"}} rowSpan={2}>
											#
										</th>
										<th style={{ backgroundColor: "#6e6c6c", color: "#fff" }} rowSpan={2}>
											Team Name
										</th> */}
										<th style={{ backgroundColor: "#6e6c6c", color: "#fff", position: "sticky", left: 0, zIndex: 2, }} rowSpan={2}>
											#
										</th>
										<th style={{ backgroundColor: "#6e6c6c", color: "#fff", position: "sticky", left: 140, zIndex: 2, }} rowSpan={2}>
											Team Name
										</th>
										{complianceCategories.map((category, index) => (
											<th
												key={index}
												style={{ backgroundColor: "#6e6c6c", color: "#fff" }}
												colSpan={3}
												className="text-center"
											>
												{category.category} - ({category.frequency})<br />
												{((category?.frequency === "Weekly") ? category?.week : "")}
												{((category?.frequency === "Monthly") ? category?.year + " - " + category?.month : "")}
											</th>
										))}
									</tr>
									{complianceCategories.map((category, index) => (
										<>
											<th className="text-center">Self</th>
											<th className="text-center">RO</th>
											<th className="text-center">Evidence</th>
										</>
									))}
								</thead>
								<tbody>
									{employeeCompliances.map((employeeCompliance, index) => (
										<React.Fragment key={index}>
											<tr>
												<td style={{ position: "sticky", left: 0, zIndex: 2, }}>
													{index + 1} <br />
													{((employeeCompliance?.selfActionPending ?? 0) > 0) &&
														(<Badge style={{cursor: "pointer"}} title="Pending For Declare" bg="info" className="ms-1">{employeeCompliance?.selfActionPending}</Badge>)
													}
													{((employeeCompliance?.roActionPending ?? 0) > 0) &&
														(<Badge style={{cursor: "pointer"}} title="Pending For Review" bg="warning" className="ms-1">{employeeCompliance?.roActionPending}</Badge>)
													}
												</td>
												<td style={{ position: "sticky", left: 140, zIndex: 2, }}>
													{employeeCompliance?.Name} <br /> ({employeeCompliance?.GlobalCode})
												</td>
												{complianceCategories.map((category, indexCC) => (
													<>
														<td className="text-center fw-bold">
															{employeeCompliance[category?.category] != null && (
																<>
																{((employeeCompliance[category?.category]?.selfAck) && !(employeeCompliance[category?.category]?.roAck)) && (<FaCheck size={20} className="ms-1 text-success" />)}
																{((employeeCompliance[category?.category]?.selfAck) && (employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "APPROVED")) && ({/*<FaCheck size={20} className="ms-1 text-success" />*/})}
																{(!(employeeCompliance[category?.category]?.selfAck) && (employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "APPROVED")) && ({/*<FaCheck size={20} className="ms-1 text-success" />*/})}
																{(!(employeeCompliance[category?.category]?.selfAck) && !(employeeCompliance[category?.category]?.roAck)) && (<span style={{width: 90}} class="btn btn-sm btn-info">Pending</span>)}
																{(!(employeeCompliance[category?.category]?.selfAck) && (employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "SEND BACK")) && (<span style={{width: 90}} class="btn btn-sm btn-info">Pending</span>)}
																{(category?.category?.toUpperCase() === "GPS411" && employeeCompliance[category?.category]?.sheet411 != null) && 
																	(
																		<a target="_blank" href={employeeCompliance[category?.category]?.sheet411}>
																			<FaExternalLinkAlt size={15} className="ms-1 fa-2x text-success" />
																		</a>
																	)
																}
																</>
															)}
															{employeeCompliance[category?.category] == null && (
																<span style={{width: 90}} class="btn btn-sm btn-disabled">Not Required</span>
															)}
														</td>
														<td className="text-center">
															{employeeCompliance[category?.category] != null && (
																<>
																{(employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "APPROVED") && (<><span style={{width: 90}} class="btn btn-sm btn-success">{employeeCompliance[category?.category]?.roStatus}</span></>/*<FaCheck size={20} className="ms-1 text-success" />*/)}
																{(employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "SEND BACK") && (<><span style={{width: 90}} class="btn btn-sm btn-info">{employeeCompliance[category?.category]?.roStatus}</span></>)}
																{(employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "NON-COMPLIANCE") && (<><span style={{width: 90}} class="btn btn-sm btn-danger">{employeeCompliance[category?.category]?.roStatus}</span></>)}
																{!(employeeCompliance[category?.category]?.roAck) && (<><span style={{width: 90}} class="btn btn-sm btn-warning" onClick={() => handleROAction(index, category?.category, employeeCompliance[category?.category]?.id ?? null)}>Pending</span></>)}{/*<FaPaperPlane size={20} className="ms-1 text-warning" title="Click to update status" cursor={"pointer"} onClick={() => handleROAction(index, category?.category, employeeCompliance?.[category?.category]?.id)} />*/}
																</>
															)}
															{employeeCompliance[category?.category] == null && (
																<span style={{width: 90}} class="btn btn-sm btn-disabled">Not Required</span>
															)}
														</td>
														<td className="text-center">
															{((employeeCompliance[category?.category]?.selfEvidence ?? "") !== "") && (															
																<a target="_blank" href={JSON.parse(employeeCompliance[category?.category]?.selfEvidence ?? "{}")?.fileUrl ?? "javascript:void(0);"}>
																	Download <FaCloudArrowDown size={10} className="ms-1 fa-2x text-success" />
																</a>
															)}
														</td>
													</>
												))}
											</tr>
											{/* Second Row - Additional Row for same ID & Name */}
											<tr>
												
											</tr>
										</React.Fragment>
									))}
								</tbody>
							</Table>
						</div>
					</Card.Body>
				</Card>
				)}
				

				{/* Modal Component */}
				<Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
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
				{/* Modal Component */}
				<Modal show={showROActionModal} onHide={() => setShowROActionModal(false)} size="">
					<Modal.Header closeButton>
						<Modal.Title>RO Action</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form onSubmit={updateROStatus}>
							<Form.Group>
								<div className="form-group">
									<label style={{color: "#000"}} htmlFor="Status">Status:</label>
									<Form.Select
										size="sm"
										//value={selectedRoData[id]}
										onChange={(e) =>
											setEmployeeComplianceROStatus(e.target.value)
										}
										className="me-2"
										required
									>
										<option value="">Status</option>
										<option value="Approved">Approved</option>
										<option value="Send Back">Send Back</option>
										<option value="Non-Compliance">Non-Compliance</option>
									</Form.Select>
								</div>
								<div className="form-group text-white">
									<label style={{color: "#000"}} htmlFor="email">RO Comment:</label>
									<input type="text" id="RoInput" value={employeeComplianceROInput} onChange={(e) => setEmployeeComplianceROInput(e.target.value)} placeholder="Enter RO Comment" required autoComplete="off" />
								</div>
								<button type="submit" className="btn btn-sm btn-success float-end">
									Submit
								</button>
							</Form.Group>
							</form>
					</Modal.Body>
				</Modal>
			</Container>
		</div>
	);
}

export default Ro;
