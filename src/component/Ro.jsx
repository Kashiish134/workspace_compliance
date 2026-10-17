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
	Tab
} from "react-bootstrap";
import { FaTachometerAlt, FaCheck, FaUser, FaCalendarAlt, FaExternalLinkAlt, FaUndoAlt, FaSpinner } from "react-icons/fa";
import { FaCloudArrowDown} from "react-icons/fa6";
import { apiCall } from "../api/apiUtil";

function Ro() {
	const [globalCode, setGlobalCode] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	const [totalEmployeeCount, setTotalEmployeeCount] = useState(0);
	const [pendingForSelfDeclare, setPendingForSelfDeclare] = useState(0);
	const [pendingForSelfReview, setPendingForReview] = useState(0);
	const [weekView, setWeekView] = useState(0);
	const [monthView, setMonthView] = useState(0);
	const [weeklyPending, setWeeklyPending] = useState(0);
	const [monthlyPending, setMonthlyPending] = useState(0);
	const [nonCompliancePending, setNonCompliancePending] = useState(0);
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

	const [selectedTab, setSelectedTab] = useState("");
	// Define dynamic table data
	const [employeeCompliances, setEmployeeCompliances] = useState([]);

	// Define state for dropdown selection
		//tableData.reduce((acc, item) => ({ ...acc, [item.id]: "Pending" }), {})
	
	const [complianceCategoryWeeks, setComplianceCategoryWeeks] = useState([]);
	const [complianceCategories, setComplianceCategories] = useState([]);
	const [employeeComplianceUpdateIndex, setEmployeeComplianceUpdateIndex] = useState(null);
	const [employeeComplianceId, setEmployeeComplianceId] = useState(null);
	const [employeeComplianceROInput, setEmployeeComplianceROInput] = useState(null);
	const [employeeComplianceROStatus, setEmployeeComplianceROStatus] = useState(null);

	// Modal State
	const [showModal, setShowModal] = useState(false);
	const [modalTitle] = useState("");
	const [modalContent] = useState("");

	const [showROActionModal, setShowROActionModal] = useState(false);

	const [showROExceptionApprovalModal, setShowROExceptionApprovalModal] = useState(false);
	const [fileUploadingFlag, setFileUploadingFlag] = useState(false);
	const [employeeComplianceROExceptionStatus, setEmployeeComplianceROExceptionStatus] = useState(null);
	const [roExceptionalFile, setRoExceptionalFile] = useState(false);
	const [isModalFormSubmissionStatus, setIsModalFormSubmissionStatus] = useState(false);
		
	const navigate = useNavigate();

	useEffect(() => {
		//console.log("Global Code", sessionStorage.getItem("globalCode"));
		let globalCode = sessionStorage.getItem("globalCode");
		if (globalCode) {
			setGlobalCode(globalCode);
			setUserRoles(JSON.parse(sessionStorage.getItem("userRoles")));
			setSelectedTab("Weekly");
		} else {
			navigate("/");
		}
	}, [navigate]);

	useEffect(() => {		
		if (globalCode) {			
			setComplianceCategoryWeeks([]);
			setComplianceCategories([]);
			setEmployeeCompliances([]);
			getROCompliance(globalCode, selectedTab);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTab, selectedMonth]);

	const getROCompliance = (globalCode, type) => {
		apiCall(`/EmployeeCompliance/GetROCompliance/${globalCode}/${type}/${moment(selectedMonth).format("YYYY-MM-DD")}` , {
			method: "GET"
		})
		.then((data) => {
			console.log("Backend Response:", data.complianceCategoryWeeks);
			setWeekView(data?.summary?.weekView ?? 0);
			setMonthView(data?.summary?.monthView ?? 0);
			setWeeklyPending(data?.summary?.weeklyPending ?? 0);
			setMonthlyPending(data?.summary?.monthlyPending ?? 0);
			setNonCompliancePending(data?.summary?.nonCompliancePending ?? 0);
			setComplianceCategoryWeeks(data.complianceCategoryWeeks ?? []);
			setComplianceCategories(data.complianceCategory ?? []);
			//setEmployeeCompliances(updateEmployeeWiseActionPending(data.employeeCompliances ?? []));
			setEmployeeCompliances(data.employeeCompliances ?? []);
			setCounters(data.employeeCompliances ?? []);
			// console.log(complianceCategoryWeeks);
			// console.log(complianceCategories);
			// if((data?.summary?.weekView ?? 0) == 0) {
			// 	setSelectedTab("Monthly");
			// }
		})
		.catch((err) => {
			alert(err);
			console.error("Error:", err);
		});
	};

	const setCounters = (data) => {
		// let data = data.employeeCompliances;
		let total = data?.length;
		let pendingForSelfDeclare = data?.filter(ec => ((ec.PendingToDeclare ?? 0) > 0)).length;
		let pendingForReview = data?.filter(ec => ((ec.PendingForReview ?? 0) > 0)).length;
		// let completed = data.filter(ec => (ec.selfAck || (ec.roAck && ec.roStatus.toUpperCase() === "REVIEWED"))).length;
		// let pendingClarification = data.filter(ec => (ec.roAck && ec.roStatus.toUpperCase() === "SEND BACK")).length;
		//let pending = total - completed - pendingClarification;
		setTotalEmployeeCount(total);
		setPendingForSelfDeclare(pendingForSelfDeclare);
		setPendingForReview(pendingForReview);
		//setPendingCount(pending);
	}

	// const updateEmployeeWiseActionPending = (data) => {
	// 	return data?.map((employee) => {
	// 		let selfActionPending = 0;
	// 		let roActionPending = 0;
			
	// 		let empData = { ...employee };
	// 		// Iterate over each category dynamically
	// 		Object.keys(employee).forEach((key) => {
	// 			if (typeof employee[key] === "object" && employee[key] !== null) {
	// 				if ((!(employee[key]?.selfAck ?? false) && !(employee[key]?.roAck ?? false))
	// 					|| (!(employee[key]?.selfAck ?? false) && (employee[key]?.roAck ?? false)) && (employee[key]?.roStatus?.toUpperCase() === "SEND BACK")) selfActionPending++;
	// 				if (!(employee[key]?.roAck ?? false)) roActionPending++;
	// 			}
	// 		});
	// 		empData.selfActionPending = selfActionPending;
	// 		empData.roActionPending = roActionPending;
			
	// 		return empData;
	// 	});
	// 	// console.log("---------------------------Sucesss----------------------------------------");
	// 	// console.log(JSON.stringify(transformData, null, "\t"));
	// 	//return transformData;
	// };

	// Handle dropdown change
	// Function to handle modal opening

	// Modify the function to handle RO comments modal
	
	const handleROAction = (eIndex, cIndex, wIndex, employeeComplianceId) => {
		let updatedEmployeeComplianceUpdateIndex = {};
		updatedEmployeeComplianceUpdateIndex.eIndex = eIndex;
		updatedEmployeeComplianceUpdateIndex.cIndex = cIndex;
		updatedEmployeeComplianceUpdateIndex.wIndex = wIndex;
				
		setEmployeeComplianceUpdateIndex(updatedEmployeeComplianceUpdateIndex);
		setEmployeeComplianceId(employeeComplianceId);
		setShowROActionModal(true);
	}
	const updateROStatus = async (event) => {
		event.preventDefault();
		setIsModalFormSubmissionStatus(true);

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
				if(employeeComplianceUpdateIndex?.wIndex != null) {
					updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex][employeeComplianceUpdateIndex?.cIndex][employeeComplianceUpdateIndex?.wIndex].roStatus = employeeComplianceROStatus;
					updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex][employeeComplianceUpdateIndex?.cIndex][employeeComplianceUpdateIndex?.wIndex].roAck = true;
				} else {
					updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex][employeeComplianceUpdateIndex?.cIndex].roStatus = employeeComplianceROStatus;
					updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex][employeeComplianceUpdateIndex?.cIndex].roAck = true;
				}
				//setEmployeeCompliances(updateEmployeeWiseActionPending(updatedEmployeeCompliances));				
				setEmployeeCompliances(updatedEmployeeCompliances);				
				setCounters(updatedEmployeeCompliances);
				// if(updatedEmployeeCompliances.length > 0) {
					
				// }
            } else {				
				alert(data.message);
			}
			setIsModalFormSubmissionStatus(false);
        })
        .catch((err) => {
            alert(err);
            console.error("Error:", err);
			setIsModalFormSubmissionStatus(false);
        });
	}

	const handleExceptionalApprovalModal = (index, empCompliance) => {
		let updatedEmployeeComplianceUpdateIndex = {};
		updatedEmployeeComplianceUpdateIndex.eIndex = index;
		updatedEmployeeComplianceUpdateIndex.cIndex = null; // Not required for non-compliance
		updatedEmployeeComplianceUpdateIndex.wIndex = null; // Not required for non-compliance

		setEmployeeComplianceUpdateIndex(updatedEmployeeComplianceUpdateIndex);
		setEmployeeComplianceId(empCompliance?.id);
		setShowROExceptionApprovalModal(true);
	}
	const updateROExceptionStatus = async(event) => {		
		event.preventDefault();
		setIsModalFormSubmissionStatus(true);
		setFileUploadingFlag(true);
		const formData = new FormData();
		formData.append('file', roExceptionalFile);
		const response = await apiCall("/EmployeeCompliance/UploadExceptionEvideceByRO?employeeComplianceId=" + employeeComplianceId + "&roExceptionalStatus=" + employeeComplianceROExceptionStatus, {
			method: "POST",
			body: formData,
		});
		setIsModalFormSubmissionStatus(false);
		setFileUploadingFlag(false);
		let updatedEmployeeCompliances = [...employeeCompliances];
		updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex].roExceptionalEvidence = JSON.stringify(response?.fileDetail);
		updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex].roExceptionalAck = true;
		updatedEmployeeCompliances[employeeComplianceUpdateIndex?.eIndex].roExceptionalStatus = employeeComplianceROExceptionStatus;
		setEmployeeCompliances(updatedEmployeeCompliances);
		alert(response?.message);
		setShowROExceptionApprovalModal(false);
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
						<div className="gap-2 ms-auto mb-2" style={{width: "250px"}}>							
							<label className="align-items-center mt-2">Payroll Month</label>
							{/* Month Picker with Calendar Icon inside Input */}
							<div className="position-relative">
								<DatePicker selected={selectedMonth} onChange={(date) => setSelectedMonth(date)} dateFormat="MMMM yyyy" showMonthYearPicker className="form-control pe-5"  />
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
					</div>
				</div>
				{/* Buttons */}
				<Row className="mb-3">
					<Col md={12} className="d-flex justify-content-end">
						<Button variant="primary" size="sm" className="me-2 responsive-button" >
							Total Reportee{" "}
							<span className="badge bg-light text-dark ms-2">{totalEmployeeCount}</span>
						</Button>
						<Button variant="info" size="sm" className="me-2 responsive-button">
							Not Declared Yet{" "}
							<span className="badge bg-light text-dark ms-2">{pendingForSelfDeclare}</span>
						</Button>
						<Button variant="warning" size="sm" className="me-2 responsive-button">
							Review Pending{" "}
							<span className="badge bg-light text-dark ms-2">{pendingForSelfReview}</span>
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
				
				{(Number(weekView) === 0 && Number(monthView) === 0) ? (<Tabs  className="mb-3"><Tab eventKey="" title="No Content" /></Tabs>) : (<></>)}					
				<Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} className="mb-3" >
					{(weekView > 0) ? (<Tab eventKey="Weekly" title={<>Weekly <span className="badge bg-secondary text-light ms-2">{weeklyPending}</span></>} />) : (<></>)}
					{(monthView > 0) ? (<Tab eventKey="Monthly" title={<>Monthly <span className="badge bg-secondary text-light ms-2">{monthlyPending}</span></>} />) : (<></>)}
					{(weekView > 0 || monthView > 0) ? (<Tab eventKey="Non-Compliance" title={<>Non-Compliance <span className="badge bg-secondary text-light ms-2">{nonCompliancePending}</span></>} />) : (<></>)}
				</Tabs>
				
				{(selectedTab === "Weekly") && complianceCategoryWeeks?.map((cw, index) => (
						<Card key={index} style={{marginTop: 10}}>
							<Card.Header>
								{cw?.category}
							</Card.Header>
							<Card.Body>
								{/* Responsive Table */}
								<div className="table-responsive" style={{ overflowX: "auto", maxHeight: "500px" }}>
									<Table striped bordered hover className="mt-1">
										<thead>
											<tr>
												<th style={{ backgroundColor: "#6e6c6c", color: "#fff", position: "sticky", left: 0, zIndex: 2, width: "80px", minWidth: "80px", maxWidth: "80px",  textAlign: "center",}} rowSpan={2}>
													#
												</th>
												<th style={{ backgroundColor: "#6e6c6c", color: "#fff", position: "sticky", left: "80px", zIndex: 2, width: "200px", minWidth: "200px", maxWidth: "200px",}} rowSpan={2}>
													Team Name
												</th>
											{cw.weeks?.map((week, index) => (
												<th key={index} style={{ backgroundColor: "#6e6c6c", color: "#fff" }} colSpan={3} className="text-center" >
													{cw.category} - ({cw.frequency})<br />
													{week?.week}
												</th>
											))}
											</tr>
											<tr>															
											{cw.weeks?.map((week, index) => (
												<React.Fragment key={index}>
													<th className="text-center">Self</th>
													<th className="text-center">RO</th>
													<th className="text-center">Evidence</th>
												</React.Fragment>
											))}
											</tr>
										</thead>
										<tbody>
											{employeeCompliances?.map((employeeCompliance, index) => (
											<tr key={index}>
												<td style={{ position: "sticky", left: 0, zIndex: 2, width: "80px", minWidth: "80px", maxWidth: "80px", textAlign: "center", }}>{index + 1} </td>
												<td style={{ position: "sticky", left: "80px", zIndex: 2, width: "200px", minWidth: "200px", maxWidth: "200px",}}>
													{employeeCompliance?.Name} <br /> ({employeeCompliance?.GlobalCode})
												</td>
												{cw.weeks?.map((week, cindex) => (
													<React.Fragment key={cindex}>
														<td className="text-center fw-bold">
															{(employeeCompliance?.[cw?.category]?.[week?.week] ?? null) != null && (
															<>
																{((employeeCompliance?.[cw?.category]?.[week?.week]?.selfAck ?? false) && (employeeCompliance?.[cw?.category]?.[week?.week]?.selfStatus?.toUpperCase() === "DECLARED") && !(employeeCompliance?.[cw?.category]?.[week?.week]?.roAck ?? false)) && (<FaCheck size={20} className="ms-1 text-success" />)}
																{((employeeCompliance?.[cw?.category]?.[week?.week]?.selfAck) && (employeeCompliance?.[cw?.category]?.[week?.week]?.selfStatus?.toUpperCase() === "ON LEAVE")) && (<span style={{width: 90}} className="btn btn-sm btn-success">On Leave</span>)}
																{((employeeCompliance?.[cw?.category]?.[week?.week]?.selfAck) && (employeeCompliance?.[cw?.category]?.[week?.week]?.selfStatus?.toUpperCase() === "DECLARED") && (employeeCompliance?.[cw?.category]?.[week?.week]?.roAck && employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus?.toUpperCase() === "REVIEWED")) && (<FaCheck size={20} className="ms-1 text-success" />)}
																{(!(employeeCompliance?.[cw?.category]?.[week?.week]?.selfAck) && (employeeCompliance?.[cw?.category]?.[week?.week]?.roAck && employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus?.toUpperCase() === "REVIEWED")) && (<FaCheck size={20} className="ms-1 text-success" />)}
																{(!(employeeCompliance?.[cw?.category]?.[week?.week]?.selfAck) && !(employeeCompliance?.[cw?.category]?.[week?.week]?.roAck)) && (<span style={{width: 90}} className="btn btn-sm btn-info">Pending</span>)}
																{(!(employeeCompliance?.[cw?.category]?.[week?.week]?.selfAck) && (employeeCompliance?.[cw?.category]?.[week?.week]?.roAck && employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus?.toUpperCase() === "SEND BACK")) && (<span style={{width: 90}} className="btn btn-sm btn-info">Pending</span>)}
																{(cw?.category?.toUpperCase() === "GPS411" && employeeCompliance?.[cw?.category]?.[week?.week]?.sheet411 != null) && 
																	(
																		<a target="_blank" rel="noopener noreferrer" href={employeeCompliance?.[cw?.category]?.[week?.week]?.sheet411}>
																			<FaExternalLinkAlt size={15} className="ms-1 fa-2x text-success" />
																		</a>
																	)
																}
																{(employeeCompliance?.[cw?.category]?.[week?.week] ?? null) == null && (
																	<span style={{width: 90}} className="btn btn-sm btn-disabled">Not Required</span>
																)}
															</>
															)}
														</td>
														<td className="text-center">
															{(employeeCompliance?.[cw?.category]?.[week?.week] ?? null) != null && (
																<>
																{(employeeCompliance?.[cw?.category]?.[week?.week]?.roAck && employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus?.toUpperCase() === "REVIEWED") && (<><span style={{width: 120}} className="btn btn-sm btn-success">{employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus}</span></>/*<FaCheck size={20} className="ms-1 text-success" />*/)}
																{(employeeCompliance?.[cw?.category]?.[week?.week]?.roAck && employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus?.toUpperCase() === "SEND BACK") && (<><span style={{width: 120}} className="btn btn-sm btn-info">{employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus}</span><br /><button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => handleROAction(index, cw?.category, week?.week, employeeCompliance?.[cw?.category]?.[week?.week]?.id ?? null)}>Decision Changed ? <FaUndoAlt style={{ fontSize: "10px" }} /></button></>)}
																{(employeeCompliance?.[cw?.category]?.[week?.week]?.roAck && employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus?.toUpperCase() === "NON-COMPLIANCE") && (<><span style={{width: 120}} className="btn btn-sm btn-danger">{employeeCompliance?.[cw?.category]?.[week?.week]?.roStatus}</span><br /><button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => handleROAction(index, cw?.category, week?.week, employeeCompliance?.[cw?.category]?.[week?.week]?.id ?? null)}>Decision Changed ? <FaUndoAlt style={{ fontSize: "10px" }} /></button></>)}
																{!(employeeCompliance?.[cw?.category]?.[week?.week]?.roAck) && (<><span style={{width: 120}} className="btn btn-sm btn-warning" onClick={() => handleROAction(index, cw?.category, week?.week, employeeCompliance?.[cw?.category]?.[week?.week]?.id ?? null)}>Pending</span></>)}
																</>
															)}
															{(employeeCompliance?.[cw?.category]?.[week?.week] ?? null) == null && (
																<span style={{width: 90}} className="btn btn-sm btn-disabled">Not Required</span>
															)}
														</td>
														<td className="text-center">
															{((employeeCompliance?.[cw?.category]?.[week?.week]?.selfEvidence ?? "") !== "") && (															
																<a target="_blank" rel="noopener noreferrer" href={JSON.parse(employeeCompliance?.[cw?.category]?.[week?.week]?.selfEvidence ?? "{}")?.fileUrl ?? undefined}>
																	Download <FaCloudArrowDown size={18} className="ms-1 fa-2x text-success" />
																</a>
															)}
														</td>
													</React.Fragment>
												))}
											</tr>
											))}
										</tbody>
									</Table>
								</div>
							</Card.Body>
						</Card>
					)
				)}
				
				{(selectedTab === "Monthly") && ((complianceCategories ?? []).length > 0) && (
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
										<th style={{ backgroundColor: "#6e6c6c", color: "#fff", position: "sticky", left: 0, zIndex: 2, width: "80px", minWidth: "80px", maxWidth: "80px", textAlign: "center",}} rowSpan={2}>
											#
										</th>
										<th style={{ backgroundColor: "#6e6c6c", color: "#fff", position: "sticky", left: "80px", zIndex: 2, width: "200px", minWidth: "200px", maxWidth: "200px", textAlign: "center",}} rowSpan={2}>
											Team Name
										</th>
										{complianceCategories?.map((category, index) => (
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
									{complianceCategories?.map((category, index) => (
										<React.Fragment key={index}>
											<th className="text-center">Self</th>
											<th className="text-center">RO</th>
											<th className="text-center">Evidence</th>
										</React.Fragment>
									))}
								</thead>
								<tbody>
									{employeeCompliances?.map((employeeCompliance, index) => (
									<tr key={index}>
										<td style={{ position: "sticky", left: 0, zIndex: 2, width: "80px", minWidth: "80px", maxWidth: "80px", textAlign: "center",}}>
											{index + 1} <br />
											{/* {((employeeCompliance?.selfActionPending ?? 0) > 0) &&
												(<Badge style={{cursor: "pointer"}} title="Pending For Declare" bg="info" className="ms-1">{employeeCompliance?.selfActionPending}</Badge>)
											}
											{((employeeCompliance?.roActionPending ?? 0) > 0) &&
												(<Badge style={{cursor: "pointer"}} title="Pending For Review" bg="warning" className="ms-1">{employeeCompliance?.roActionPending}</Badge>)
											} */}
										</td>
										<td style={{ position: "sticky", left: "80px", zIndex: 2, width: "200px", minWidth: "200px", maxWidth: "200px",}}>
											{employeeCompliance?.Name} <br /> ({employeeCompliance?.GlobalCode})
										</td>
										{complianceCategories?.map((category, indexCC) => (
											<React.Fragment key={indexCC}>
												<td className="text-center fw-bold">
													{employeeCompliance[category?.category] != null && (
														<>
														{((employeeCompliance[category?.category]?.selfAck) && !(employeeCompliance[category?.category]?.roAck)) && (<FaCheck size={20} className="ms-1 text-success" />)}
														{((employeeCompliance[category?.category]?.selfAck) && (employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "REVIEWED")) && (<FaCheck size={20} className="ms-1 text-success" />)}
														{(!(employeeCompliance[category?.category]?.selfAck) && (employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "REVIEWED")) && (<FaCheck size={20} className="ms-1 text-success" />)}
														{(!(employeeCompliance[category?.category]?.selfAck) && !(employeeCompliance[category?.category]?.roAck)) && (<span style={{width: 90}} className="btn btn-sm btn-info">Pending</span>)}
														{(!(employeeCompliance[category?.category]?.selfAck) && (employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "SEND BACK")) && (<span style={{width: 120}} className="btn btn-sm btn-info">Pending</span>)}
														{(category?.category?.toUpperCase() === "GPS411" && employeeCompliance[category?.category]?.sheet411 != null) && 
															(
																<a target="_blank" rel="noopener noreferrer" href={employeeCompliance[category?.category]?.sheet411}>
																	<FaExternalLinkAlt size={15} className="ms-1 fa-2x text-success" />
																</a>
															)
														}
														</>
													)}
													{employeeCompliance[category?.category] == null && (
														<span style={{width: 90}} className="btn btn-sm btn-disabled">Not Required</span>
													)}
												</td>
												<td className="text-center">
													{employeeCompliance[category?.category] != null && (
														<>
														{(employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "REVIEWED") && (<><span style={{width: 120}} className="btn btn-sm btn-success">{employeeCompliance[category?.category]?.roStatus}</span></>/*<FaCheck size={20} className="ms-1 text-success" />*/)}
														{(employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "SEND BACK") && (<><span style={{width: 120}} className="btn btn-sm btn-info">{employeeCompliance[category?.category]?.roStatus}</span><br /><button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => handleROAction(index, category?.category, null, employeeCompliance[category?.category]?.id ?? null)}>Decision Changed ? <FaUndoAlt style={{ fontSize: "10px" }} /></button></>)}
														{(employeeCompliance[category?.category]?.roAck && employeeCompliance[category?.category]?.roStatus?.toUpperCase() === "NON-COMPLIANCE") && (<><span style={{width: 120}} className="btn btn-sm btn-danger">{employeeCompliance[category?.category]?.roStatus}</span><br /><button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={() => handleROAction(index, category?.category, null, employeeCompliance[category?.category]?.id ?? null)}>Decision Changed ? <FaUndoAlt style={{ fontSize: "10px" }} /></button></>)}
														{!(employeeCompliance[category?.category]?.roAck) && (<><span style={{width: 120}} className="btn btn-sm btn-warning" onClick={() => handleROAction(index, category?.category, null, employeeCompliance[category?.category]?.id ?? null)}>Pending</span></>)}
														</>
													)}
													{employeeCompliance[category?.category] == null && (
														<span style={{width: 90}} className="btn btn-sm btn-disabled">Not Required</span>
													)}
												</td>
												<td className="text-center">
													{((employeeCompliance[category?.category]?.selfEvidence ?? "") !== "") && (															
														<a target="_blank" rel="noopener noreferrer" href={JSON.parse(employeeCompliance[category?.category]?.selfEvidence ?? "{}")?.fileUrl ?? undefined}>
															Download <FaCloudArrowDown size={18} className="ms-1 fa-2x text-success" />
														</a>
													)}
												</td>
											</React.Fragment>
										))}
									</tr>
									))}
								</tbody>
							</Table>
						</div>
					</Card.Body>
				</Card>
				)}

				{(selectedTab === "Non-Compliance") && ((employeeCompliances ?? []).length > 0) && (
					<Card>
						<Card.Body>
							{/* Responsive Table */}
							<div className="table-responsive" style={{ overflowX: "auto", maxHeight: "500px" }}>
								<Table striped bordered hover className="mt-1">
									<thead>
										<tr>
											<th style={{ position: "sticky", left: 0, zIndex: 2, width: "80px", minWidth: "80px", maxWidth: "80px", textAlign: "center",}}>#</th>
											<th style={{ position: "sticky", left: "80px", zIndex: 2, width: "200px", minWidth: "200px", maxWidth: "200px",  textAlign: "center",}}>Name</th>
											<th>Category<br />Compliance For</th>
											<th>Exception Request Details</th>
											<th>Exception Request Status Details</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
									{employeeCompliances?.map((employeeCompliance, index) => (
										<tr key={index}>
											<td style={{ position: "sticky", left: 0, zIndex: 2, width: "80px", minWidth: "80px", maxWidth: "80px", textAlign: "center",}}>{index + 1}</td>
											<td style={{ position: "sticky", left: "80px", zIndex: 2, width: "200px", minWidth: "200px", maxWidth: "200px",}}>
												{employeeCompliance?.name} <br /> ({employeeCompliance?.globalCode})
											</td>
											<td>
												{employeeCompliance?.category}<br />
												{employeeCompliance?.week ?? (employeeCompliance?.year + " - " + employeeCompliance?.month)}
											</td>
											<td>
												{(employeeCompliance?.selfExceptionalAck ?? false) ? (
													<>
														Requested By User  <br /> {
														<a target="_blank" rel="noopener noreferrer" href={JSON.parse(employeeCompliance?.selfExceptionalEvidence ?? "{}")?.fileUrl ?? undefined}>
															Download <FaCloudArrowDown size={18} className="ms-1 fa-2x text-success" />
														</a>
														}
													</>
												) : "-"}<br />
												{(employeeCompliance?.selfExceptionalAckOn != null) ? moment(employeeCompliance?.selfExceptionalAckOn).format("DD/MMM/YYYY HH:mm") : "-"}
											</td>
											<td>
												{(!(employeeCompliance?.selfExceptionalAck ?? false) && (employeeCompliance?.roExceptionalStatus ?? "Request Not Initiated.")) }
												{((employeeCompliance?.selfExceptionalAck ?? false) && (employeeCompliance?.roExceptionalStatus ?? "Review Pending At RO")) }
												{(employeeCompliance?.roExceptionalStatus?.toUpperCase() === "APPROVED") && (
													<>
														<br /> {
														<a target="_blank" rel="noopener noreferrer" href={JSON.parse(employeeCompliance?.roExceptionalEvidence ?? "{}")?.fileUrl ?? undefined}>
															Download <FaCloudArrowDown size={18} className="ms-1 fa-2x text-success" />
														</a>
														}
													</>
												)}<br />
												{(employeeCompliance?.roExceptionalAckOn != null) ? moment(employeeCompliance?.roExceptionalAckOn).format("DD/MMM/YYYY HH:mm") : "-"}
											</td>
											<td>
												{((employeeCompliance?.selfExceptionalAck ?? false) && !(employeeCompliance?.roExceptionalAck ?? false)) &&
													<Button variant="warning" size="sm" style={{width: 150}} onClick={() => handleExceptionalApprovalModal(index, employeeCompliance)}>
														Review Request
													</Button>
												}
												{((employeeCompliance?.selfExceptionalAck ?? false) && (employeeCompliance?.roExceptionalAck ?? false) && (employeeCompliance?.roExceptionalStatus?.toUpperCase() === "REJECTED")) &&
													<Button variant="primary" size="sm" style={{width: 150}} onClick={() => handleExceptionalApprovalModal(index, employeeCompliance)}>
														Exceptional Approve
													</Button>
												}
												{(!(employeeCompliance?.selfExceptionalAck ?? false) && !(employeeCompliance?.roExceptionalAck ?? false)) &&
													<Button variant="primary" size="sm" style={{width: 150}} onClick={() => handleExceptionalApprovalModal(index, employeeCompliance)}>
														Exceptional Approve
													</Button>
												}
											</td>
										</tr>
									))}									
									{(Array.isArray(employeeCompliances) && employeeCompliances.length === 0) && 
										(
											<tr>
												<td colSpan="9" className="text-center text-muted">
													No non-complainces found.
												</td>
											</tr>
										)
									}
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
										<option value="Reviewed">Reviewed</option>
										<option value="Send Back">Send Back</option>
										<option value="Non-Compliance">Non-Compliance</option>
									</Form.Select>
								</div>
								<div className="form-group text-white">
									<label style={{color: "#000"}} htmlFor="email">RO Comment:</label>
									<input type="text" id="RoInput" value={employeeComplianceROInput ?? ""} onChange={(e) => setEmployeeComplianceROInput(e.target.value)} placeholder="Enter RO Comment" required autoComplete="off" />
								</div>
								<button type="submit" className="btn btn-sm btn-success float-end" disabled={isModalFormSubmissionStatus}>
									{(isModalFormSubmissionStatus) ? "Processing": "Submit"}
								</button>
							</Form.Group>
						</form>
					</Modal.Body>
				</Modal>
				<Modal show={showROExceptionApprovalModal} onHide={() => setShowROExceptionApprovalModal(false)} size="lg">
					<Modal.Header closeButton>
						<Modal.Title>RO Exception Review</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form onSubmit={updateROExceptionStatus}>
							<Form.Group>
								<div className="form-group">
									<label style={{color: "#000"}} htmlFor="Status">Status:</label>
									<Form.Select size="sm" onChange={(e) => setEmployeeComplianceROExceptionStatus(e.target.value) } className="me-2" required>
										<option value="">Status</option>
										<option value="Approved">Approve</option>
										<option value="Rejected">Reject</option>
									</Form.Select>
								</div>
								<div className="form-group text-white">
									<label style={{color: "#000"}} htmlFor="email">RO Exception Approval Attachment:</label>
									<Form.Control type="file" onChange={(event) => setRoExceptionalFile(event.target.files[0])} required />
									{/* required={(employeeCompliances[employeeComplianceUpdateIndex?.eIndex]?.selfExceptionalEvidence != null) ? false : true} */}
									{/* <span style={{color: "#FF2233"}}>* Attachment required if initiated by RO</span> */}
								</div>
								<button type="submit" className="btn btn-sm btn-success float-end" disabled={isModalFormSubmissionStatus}>
									{(isModalFormSubmissionStatus) ? "Processing": "Submit"}
								</button>
							</Form.Group>
						</form>
					</Modal.Body>
					<Modal.Footer className="justify-content-start">
						{(fileUploadingFlag && (<><FaSpinner className="me-2 spinner" /><span> File uploading inprogress. Please wait ...</span></>))}
					</Modal.Footer>
				</Modal>
			</Container>
		</div>
	);
}

export default Ro;
