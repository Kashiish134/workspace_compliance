import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Button, Card, Form, Modal, Table, Tabs, Tab } from "react-bootstrap";
import { FaUser, FaUsers, FaTachometerAlt, FaInfoCircle } from "react-icons/fa";
import DataTable from "react-data-table-component";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { apiCall } from "../api/apiUtil";

function HrPage() {
	//const [globalCode, setGlobalCode] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	const [totelEmployeeCount, setTotalEmployeeCount] = useState(0);
	const [compliancedCount, setCompliancedCount] = useState(0);
	const [nonCompliancedCount, setNonCompliancedCount] = useState(0);
	const [isCompliance] = useState(false);
	const [selectedMonth, setSelectedMonth] = useState(new Date());

	const [selectedTab, setSelectedTab] = useState("EmployeeNonCompliance");

	const [showModal, setShowModal] = useState(false);
	const [modalTitle, setModalTitle] = useState("");
	const [modalContent, setModalContent] = useState("");

	const [tableData, setTableData] = useState([]);
	const [, setEmpConditions] = useState([]);

	const [empViewEndPoint, setEmpViewEndPoint] = useState("GetEmployeeComplianceLiveStatus");
	const [empTextHeader, setEmpTextHeader] = useState("Employee Non-Compliance - LIVE REPORT");
	const [empTextButton, setEmpTextButton] = useState("View Hold Report");

	const [roSummary, setRoSummary] = useState([]);
	const [roTextHeader, setRoTextHeader] = useState("RO Non-Compliance - LIVE REPORT"); //All RO Summary
	const [roTextButton, setRoTextButton] = useState("View All RO Summary"); //View Non-Compliance RO Summary
	const [allFlag, setAllFlag] = useState("");

	const navigate = useNavigate();
	useEffect(() => {
		//console.log("Global Code", sessionStorage.getItem("globalCode"));
		let globalCode = sessionStorage.getItem("globalCode");
		if(globalCode) {
			//setGlobalCode(sessionStorage.getItem("globalCode"));
			setUserRoles(JSON.parse(sessionStorage.getItem("userRoles")));
			getEmployeeComplianceMonthlyFinal();
		} else {
			navigate("/");
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [navigate]);

	useEffect(() => {
		setTableData([]);
		getEmployeeComplianceMonthlyFinal();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [empViewEndPoint])

	useEffect(() => {
		setTableData([]);
		if(selectedTab === "EmployeeNonCompliance") {
			getEmployeeComplianceMonthlyFinal();
		} else if(selectedTab === "ROActionSummary") {
			getRoSummaryMonthly(allFlag);
		} else if(selectedTab === "ROHoldList") {
			getRONonComplianceMonthlyFinal();
		} else if(selectedTab === "EmployeeComplianceConversion") {
			getEmployeeComplianceConversion();
		} else if(selectedTab === "ROComplianceConversion") {
			getROComplianceConversion();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMonth, selectedTab, isCompliance, allFlag, userRoles]);

	const getEmployeeComplianceMonthlyFinal = () => {
		if(Array.isArray(userRoles)) {
			let filter = {
				isCompliance: (isCompliance === "true") ? true : false,
				year: moment(selectedMonth).format("YYYY"),
				month: moment(selectedMonth).format("M"),
				orgUnits: [...new Set(userRoles.map(item => item.orgUnit).filter(e => e !== null && e !== undefined))],
				companyNames: [...new Set(userRoles.map(item => item.companyName).filter(e => e !== null && e !== undefined))],
				locationNames: [...new Set(userRoles.map(item => item.locationName).filter(e => e !== null && e !== undefined))],
			}
			apiCall(`/EmployeeComplianceMonthlyFinal/${empViewEndPoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(filter),
			})
			.then((data) => {
				//console.log("Backend Response:", data);
				if (data.success) {
					setTotalEmployeeCount(data?.summary?.totalEmployee ?? 0);
					setCompliancedCount(data?.summary?.compliancedEmployee ?? 0);
					setNonCompliancedCount(data?.summary?.nonCompliancedEmployee ?? 0);
					setTableData(data.employees)
				} else {				
					alert(data.message);
				}
			})
			.catch((err) => {
				alert(err);
				console.error("Error:", err);
			});
		}
	}

	const getRoSummaryMonthly = (allFlag) => {
		if(Array.isArray(userRoles)) {
			let filter = {
				year: moment(selectedMonth).format("YYYY"),
				month: moment(selectedMonth).format("MMMM"),
				orgUnits: [...new Set(userRoles.map(item => item.orgUnit).filter(e => e !== null && e !== undefined))],
				companyNames: [...new Set(userRoles.map(item => item.companyName).filter(e => e !== null && e !== undefined))],
				locationNames: [...new Set(userRoles.map(item => item.locationName).filter(e => e !== null && e !== undefined))],
			}
			apiCall("/EmployeeCompliance/GetPendingAtRO/" + allFlag, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(filter),
			})
			.then((data) => {
				//console.log("Backend Response:", data);
				if (data.success) {
					setRoSummary(data.complianceReport)
				} else {				
					alert(data.message);
				}
			})
			.catch((err) => {
				alert(err);
				console.error("Error:", err);
			});
		}
	}

	const getEmployeeComplianceConversion = () => {
		if(Array.isArray(userRoles)) {
			let filter = {
				orgUnits: [...new Set(userRoles.map(item => item.orgUnit).filter(e => e !== null && e !== undefined))],
				companyNames: [...new Set(userRoles.map(item => item.companyName).filter(e => e !== null && e !== undefined))],
				locationNames: [...new Set(userRoles.map(item => item.locationName).filter(e => e !== null && e !== undefined))],
			}
			apiCall("/EmployeeComplianceMonthlyFinal/GetEmployeeComplianceConversionsList", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(filter),
			})
			.then((data) => {
				//console.log("Backend Response:", data);
				if (data.success) {
					setTableData(data.employees)
					//setPendingCount(data?.employees?.length ?? 0);
				} else {				
					alert(data.message);
				}
			})
			.catch((err) => {
				alert(err);
				console.error("Error:", err);
			});
		}
	}

	const getRONonComplianceMonthlyFinal = () => {
		if(Array.isArray(userRoles)) {
			let filter = {
				year: moment(selectedMonth).format("YYYY"),
				month: moment(selectedMonth).format("M"),
				orgUnits: [...new Set(userRoles.map(item => item.orgUnit).filter(e => e !== null && e !== undefined))],
				companyNames: [...new Set(userRoles.map(item => item.companyName).filter(e => e !== null && e !== undefined))],
				locationNames: [...new Set(userRoles.map(item => item.locationName).filter(e => e !== null && e !== undefined))],
			}
			apiCall(`/EmployeeComplianceMonthlyFinal/GetRONonComplianceListByMonth`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(filter),
			})
			.then((data) => {
				//console.log("Backend Response:", data);
				if (data.success) {
					setTotalEmployeeCount(data?.summary?.totalEmployee ?? 0);
					setCompliancedCount(data?.summary?.compliancedEmployee ?? 0);
					setNonCompliancedCount(data?.summary?.nonCompliancedEmployee ?? 0);
					setTableData(data.employees)
				} else {				
					alert(data.message);
				}
			})
			.catch((err) => {
				alert(err);
				console.error("Error:", err);
			});
		}
	}

	const getROComplianceConversion = () => {
		if(Array.isArray(userRoles)) {
			let filter = {
				year: moment(selectedMonth).format("YYYY"),
				month: moment(selectedMonth).format("M"),
				orgUnits: [...new Set(userRoles.map(item => item.orgUnit).filter(e => e !== null && e !== undefined))],
				companyNames: [...new Set(userRoles.map(item => item.companyName).filter(e => e !== null && e !== undefined))],
				locationNames: [...new Set(userRoles.map(item => item.locationName).filter(e => e !== null && e !== undefined))],
			}
			apiCall(`/EmployeeComplianceMonthlyFinal/GetROComplianceConversionsList`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(filter),
			})
			.then((data) => {
				//console.log("Backend Response:", data);
				if (data.success) {
					setTotalEmployeeCount(data?.summary?.totalEmployee ?? 0);
					setCompliancedCount(data?.summary?.compliancedEmployee ?? 0);
					setNonCompliancedCount(data?.summary?.nonCompliancedEmployee ?? 0);
					setTableData(data.employees)
				} else {				
					alert(data.message);
				}
			})
			.catch((err) => {
				alert(err);
				console.error("Error:", err);
			});
		}
	}



	const handleEmpView = () => {
		if(empTextButton === "View Hold Report") {
			setEmpViewEndPoint("GetEmployeeNonComplianceListByMonth")
			setEmpTextHeader("Employee Non-Compliance - HOLD REPORT");
			setEmpTextButton("View Live Report");
		} else {
			setEmpViewEndPoint("GetEmployeeComplianceLiveStatus")
			setEmpTextHeader("Employee Non-Compliance - LIVE REPORT");
			setEmpTextButton("View Hold Report");
		}
	}

	const handleROView = () => {
		if(roTextButton === "View All RO Summary") {
			setAllFlag("all");
			setRoTextHeader("All RO Summary - LIVE REPORT");
			setRoTextButton("View Non-Compliance RO Summary");
		} else {
			setAllFlag("");
			setRoTextHeader("RO Non-Compliance - LIVE REPORT");
			setRoTextButton("View All RO Summary");
		}
	}

	// Function to handle CSV download For RO Action Summary
	const handleDownloadROSummary = () => {
		const csvContent =
			"data:text/csv;charset=utf-8," +
			[
				"RO Global Code,RO Email,Total Reportee,Review Pending Of Reportee,No Action Taken By RO,Send Back Marked,Total Pending Compliances,Reviewed Compliances,Non Complianced Marked",
				...roSummary.map(
					(item) =>
						`${item.roGlobalCode},${item.roEmail},${item.totalReportee},${item.reviewPendingOfReportee},${item.noActionTakenByRO},${item.sendBackMarked},${item.pendingCompliance},${item.reviewedCompliance},${item.nonComplianceMarked}`
				),
			].join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "ro_summary.csv");
		document.body.appendChild(link);
		link.click();
	};

	// Function to handle CSV download For Non Compliance
	const handleDownloadNonCompliance = () => {
		const csvContent =
			"data:text/csv;charset=utf-8," +
			[
				"ID,Global Code,Employee Code,Name,Email,Org Unit,Company,Location,Department,Designation,CG Group,RO Email,Month,Complianced,As On Date",
				...filteredData.map(
					(item) =>
						`${item.id},${item.globalCode},${item.empCode},${item.name},${item.email},${item.orgName},${item.company},${item.location},${item.department},${item.designation},${item.cgGroup},${item.roEmail},${moment(item.year + "-" + item.month, "YYYY-M").format("MMMM YYYY")},${(item.isComplianced) ? "Yes" : "No"},${moment(item.updatedOn).format("DD/MMM/YYYY HH:mm")}`
				),
			].join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "non_compliance_data.csv");
		document.body.appendChild(link);
		link.click();
	};

	const handleDownloadComplianceConversion = () => {
		const csvContent =
			"data:text/csv;charset=utf-8," +
			[
				"ID,Global Code,Employee Code,Name,Email,Org Unit,Company,Location,Department,Designation,CG Group,RO Email,Month,Complianced,As On Date",
				...filteredData.map(
					(item) =>
						`${item.id},${item.globalCode},${item.empCode},${item.name},${item.email},${item.orgName},${item.company},${item.location},${item.department},${item.designation},${item.cgGroup},${item.roEmail},${moment(item.year + "-" + item.month, "YYYY-M").format("MMMM YYYY")},${(item.isComplianced) ? "Yes" : "No"},${moment(item.updatedOn).format("DD/MMM/YYYY HH:mm")}`
				),
			].join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "non_compliance_data.csv");
		document.body.appendChild(link);
		link.click();
	};

	// Function to handle printing
	
	// Search Filters State
	const [filters, setFilters] = useState({
		globalCode: "",
		name: "",
		location: "",
		department: "",
		cgGroup: "",
		empCode: "",
		email: "",
		company: "",
	});

	// Define custom styles for the DataTable
	// Define table columns
	const columns = [
		{ name: "#", selector: (row, index) => index + 1, sortable: false },
		{ name: "Global Code", selector: (row) => row.globalCode, sortable: true },
		{ name: "Employee Code", selector: (row) => row.empCode, sortable: true },
		{ name: "Employee Name", selector: (row) => row.name, sortable: true },
		{ name: "Email", selector: (row) => row.email, sortable: true },
		{ name: "Org Name", selector: (row) => row.orgName, sortable: true },
		{ name: "Location", selector: (row) => row.location, sortable: true },
		{ name: "Department", selector: (row) => row.department, sortable: true },
		{ name: "Designation", selector: (row) => row.designation, sortable: true },
		{ name: "CG Group", selector: (row) => row.cgGroup, sortable: true },
		{ name: "RO Email", selector: (row) => row.roEmail, sortable: true },
		{ name: "Company Name", selector: (row) => row.company, sortable: true },
		{ name: "Payroll Month", selector: (row) => moment(row.year + "-" + row.month, "YYYY-M").format("MMMM YYYY"), sortable: true },
		{ name: "Complianced", selector: (row) => row.isComplianced, sortable: true, cell: (row) => (row.isComplianced) ? "Yes" : "No" },
		{ name: "As On Date", selector: (row) => moment(row.updatedOn).format("DD/MMM/YYYY HH:mm") },
		{
			name: "Actions",
			button: true,
			cell: (row) => (
				<div>
					{/* Example action buttons */}
					<Button
						variant="info"
						size="sm"
						onClick={() =>
							handleShowEmployeeDetailsModal(moment(row.year + "-" + row.month, "YYYY-M").format("YYYY"), moment(row.year + "-" + row.month, "YYYY-M").format("MMMM"), row.globalCode, row.name)
						}
					>
						<FaInfoCircle /> {/* Use the information icon here */}
					</Button>
				</div>
			),
		},
	];

	const roSummaryColumns = [
		{ name: "#", selector: (row, index) => index + 1, sortable: false },
		{ name: "RO Global Code", selector: (row) => row.roGlobalCode, sortable: true },
		{ name: "RO Email", selector: (row) => row.roEmail, sortable: true },
		{ name: "Total Reportee", selector: (row) => row.totalReportee, sortable: true },
		{ name: "Review Pending Of Reportee", selector: (row) => row.reviewPendingOfReportee, sortable: true },
		{ name: "No Action Taken", selector: (row) => row.noActionTakenByRO, sortable: true },
		{ name: "Send Back Marked", selector: (row) => row.sendBackMarked, sortable: true },
		{ name: "Pending Compliance", selector: (row) => row.pendingCompliance, sortable: true },
		{ name: "Reviewed", selector: (row) => row.reviewedCompliance, sortable: true },
		{ name: "Non-Complianced Marked", selector: (row) => row.nonComplianceMarked, sortable: true }
		// {
		// 	name: "Actions",
		// 	button: true,
		// 	cell: (row) => (
		// 		<div>
		// 			{/* Example action buttons */}
		// 			<Button
		// 				variant="info"
		// 				size="sm"
		// 				onClick={() =>
		// 					handleShowEmployeeDetailsModal(moment(row.year + "-" + row.month, "YYYY-M").format("YYYY"), moment(row.year + "-" + row.month, "YYYY-M").format("MMMM"), row.globalCode, row.name)
		// 				}
		// 			>
		// 				<FaInfoCircle /> {/* Use the information icon here */}
		// 			</Button>
		// 		</div>
		// 	),
		// },
	];

	const complianceConversioncolumns = [
		{ name: "#", selector: (row, index) => index + 1, sortable: false },
		{ name: "Global Code", selector: (row) => row.globalCode, sortable: true },
		{ name: "Employee Code", selector: (row) => row.empCode, sortable: true },
		{ name: "Employee Name", selector: (row) => row.name, sortable: true },
		{ name: "Email", selector: (row) => row.email, sortable: true },
		{ name: "Org Name", selector: (row) => row.orgName, sortable: true },
		{ name: "Location", selector: (row) => row.location, sortable: true },
		{ name: "Department", selector: (row) => row.department, sortable: true },
		{ name: "Designation", selector: (row) => row.designation, sortable: true },
		{ name: "CG Group", selector: (row) => row.cgGroup, sortable: true },
		{ name: "RO Email", selector: (row) => row.roEmail, sortable: true },
		{ name: "Company Name", selector: (row) => row.company, sortable: true },
		{ name: "Payroll Month", selector: (row) => moment(row.year + "-" + row.month, "YYYY-M").format("MMMM YYYY"), sortable: true },
		{ name: "Complianced", selector: (row) => row.isComplianced, sortable: true, cell: (row) => (row.isComplianced) ? "Yes" : "No" },
		{ name: "As On Date", selector: (row) => moment(row.updatedOn).format("DD/MMM/YYYY HH:mm") }
	];

	// Handle input changes
	const handleInputChange = (e) => {
		setFilters({ ...filters, [e.target.name]: e.target.value });
	};

	// Apply search filters on button click
	const filteredData = tableData.filter(
		(item) =>
			(!filters.globalCode ||
				item.globalCode.toString().includes(filters.globalCode)) &&
			(!filters.company ||
				item.company.toLowerCase().includes(filters.company.toLowerCase())) &&
			(!filters.location ||
				item.location.toLowerCase().includes(filters.location.toLowerCase())) &&
			(!filters.department ||
				item.department
					.toLowerCase()
					.includes(filters.department.toLowerCase())) &&
			(!filters.cgGroup ||
				item.cgGroup.toLowerCase().includes(filters.cgGroup.toLowerCase()))
	);

	// Function to open counter modal
	const handleShowEmployeeDetailsModal = async (year, month, globalCode, name) => {
		setEmpConditions([]);
		const employeeNonComplianceFilter = {
			"year": year,
			"month": month,
			"GlobalCode" : globalCode
		};
		let empConditions = await apiCall("/EmployeeCompliance/GetEmployeeNonComplianceConditions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(employeeNonComplianceFilter),
		});
		setEmpConditions(empConditions ?? []);
		setModalTitle(`Non-Compliance conditions for the month ${moment(year + "-" + month, "YYYY-M").format("MMMM YYYY")} of ${name} (${globalCode})`);
		setModalContent(
		<>
			<Table striped bordered hover size="sm">
				<thead>
					<tr>
						<th>Condition</th>
						<th>Compliance For</th>
						<th>RO Input</th>
						<th>RO Status</th>
						<th>RO Reviewed On</th>
					</tr>
				</thead>
				<tbody>
				{Array.isArray(empConditions) && empConditions?.map((empCondition, index) => (
					<tr>
						<td>{empCondition?.category}</td>
						<td>{empCondition?.frequency} ( {empCondition?.week ?? (empCondition?.year + " - " + empCondition?.month)} )</td>
						<td>{empCondition?.roInput ?? "-"}</td>
						<td>{empCondition?.roStatus ?? "-"}</td>
						<td>{(empCondition?.roAckOn != null) ? moment(empCondition?.roAckOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
					</tr>
				))					
				}
				{(Array.isArray(empConditions) && empConditions.length === 0) && 
					(
						<tr>
							<td colSpan="5" className="text-center text-muted">
								No non-complainces found.
							</td>
						</tr>
					)
				}
				</tbody>
			</Table>
		</>);
		setShowModal(true);
	};

	// Function to close counter modal
	const handleCloseEmployeeDetailsModal = () => {
		setShowModal(false);
	};

	return (
		<div className="container mt-3 mb-3 d-flex flex-column min-vh-100">
			{/* Dashboard Title with Icon */}
			<h5 className="mb-3">
				<FaTachometerAlt className="me-2" /> HR Dashboard
			</h5>

			{/* Buttons */}
			<Row className="mb-3">
				<Col md={12} className="d-flex align-items-center">
					<Col md={3} className="me-2">
						<label className="align-items-center mt-2">Payroll Month</label>
						<DatePicker selected={selectedMonth} onChange={(date) => setSelectedMonth(date)} dateFormat="MMMM yyyy" showMonthYearPicker className="form-control" />
						<span style={{fontSize: "13px", color: "red"}}>24th of {moment(selectedMonth).subtract(1, "M").format("MMMM YYYY")} to 23rd of {moment(selectedMonth).format("MMMM YYYY")}</span>
					</Col>
					<Col md={9} className="d-flex justify-content-end">
						<a href="/user-dashboard" className="me-3">
							<Button variant="success" size="sm">
								<FaUser className="me-2" /> Self Review
							</Button>
						</a>

						{Array.isArray(userRoles) && userRoles.some(role => role.role === "RO") && (
							<a href="/ro-dashboard" className="me-3">
								<Button variant="success" size="sm">
									<FaUsers className="me-2" /> Team Review
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
					</Col>
				</Col>
			</Row>
			{/* Tab View */}
			<Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} className="mb-3">
				<Tab eventKey="EmployeeNonCompliance" title="Employee Non-Compliance List" />
				<Tab eventKey="ROActionSummary" title="RO Action Summary" />
				<Tab eventKey="ROHoldList" title="RO Hold List" />
				<Tab eventKey="EmployeeComplianceConversion" title="Employee Non-Compliance To Compliance" />
				<Tab eventKey="ROComplianceConversion" title="RO Non-Compliance To Compliance" />
			</Tabs>
						
			{/* Search Filters */}
			{(selectedTab === "EmployeeNonCompliance") && (
			<Card className="mt-3">
				<Card.Body>
					{/* Header Row with Title & Buttons */}
					<Row className="mb-3 align-items-center">
						<Col md={6}>
							<h5 className="mb-0">{empTextHeader}</h5>
							<span style={{ fontSize: "13px" }}>For current month only LIVE summary will show after 24th of current month & HOLD summary will show after action taken by Payroll team.</span>
						</Col>
						<Col md={6} className="d-flex justify-content-end">
							<Col md={4} className="me-2"></Col>
							<Col md={4} className="me-2">
								<Button variant="info" className="me-2" onClick={handleEmpView}>
									{empTextButton}
								</Button>
							</Col>
							<Col md={4}>
								<Button variant="success" className="me-2" onClick={handleDownloadNonCompliance}>
									Export to Excel
								</Button>
								{/* <Button variant="secondary" onClick={handlePrint}>
									Print
								</Button> */}
							</Col>
						</Col>
					</Row>
					<Row className="mb-3">
						<Col md={12} className="d-flex align-items-center">
							<Col md={12} className="d-flex justify-content-end">
								<Button variant="primary" size="sm" className="me-2">
									Total Employees{" "}
									<span className="badge bg-light text-dark ms-2">
										{totelEmployeeCount}
									</span>
								</Button>
								<Button variant="success" size="sm" className="me-2">
									Compliance{" "}
									<span className="badge bg-light text-dark ms-2">
										{compliancedCount}
									</span>
								</Button>
								<Button variant="warning" size="sm" className="me-2">
									Non-Compliance{" "}
									<span className="badge bg-light text-dark ms-2">
										{nonCompliancedCount}
									</span>
								</Button>
							</Col>
						</Col>
					</Row>
					{/* Search Filters */}
					<Row className="mb-3 bg-light py-2">
						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Location"
								name="location"
								value={filters.location}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Department"
								name="department"
								value={filters.department}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="CG Group"
								name="cgGroup"
								value={filters.group}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Global Code"
								name="globalCode"
								value={filters.globalCode}
								onChange={handleInputChange}
							/>
						</Col>
						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Company Name"
								name="company"
								value={filters.company}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Button
								variant="primary"
								onClick={() => setFilters({ ...filters })}
							>
								Search
							</Button>
						</Col>
					</Row>

					{/* DataTable Integration */}
					<DataTable
						title=""
						columns={columns}
						data={filteredData} // Use filtered data
						pagination
						highlightOnHover
						responsive
					/>
				</Card.Body>
			</Card>
			)}
			{(selectedTab === "ROActionSummary") && (
			<Card className="mt-3">
				<Card.Body>
					{/* Header Row with Title & Buttons */}
					<Row className="mb-3 align-items-center">
						<Col md={6}>
							<h5 className="mb-0">{roTextHeader}</h5>
						</Col>						
						<Col md={6} className="d-flex justify-content-end">
							<Col md={2}></Col>
							<Col md={6}>
								<Button variant="info" className="me-2" onClick={handleROView}>
									{roTextButton}
								</Button>
							</Col>
							<Col md={4}>
								<Button variant="success" className="me-2" onClick={handleDownloadROSummary}>
									Export to Excel
								</Button>
								{/* <Button variant="secondary" onClick={handlePrint}>
									Print
								</Button> */}
							</Col>
						</Col>
					</Row>
					
					{/* DataTable Integration */}
					<DataTable
						title=""
						columns={roSummaryColumns}
						data={roSummary} // Use filtered data
						pagination
						highlightOnHover
						responsive
					/>
				</Card.Body>
			</Card>
			)}
			{(selectedTab === "ROHoldList") && (
			<Card className="mt-3">
				<Card.Body>
					{/* Header Row with Title & Buttons */}
					<Row className="mb-3 align-items-center">
						<Col md={6}>
							<h5 className="mb-0">RO Non-Compliance - HOLD REPORT</h5>
							<span style={{ fontSize: "13px" }}>This list will be updated by payroll team before TVP release.</span>
						</Col>						
						<Col md={6} className="d-flex justify-content-end">
							<Col md={4} className="me-2"></Col>
							<Col md={4} className="me-2">
								{/* <ToggleButtonGroup type="radio" name="options" value={isCompliance.toString()} onChange={(e) => handleComplianceChange(e.target.value)}>
									<ToggleButton value="false">Show Non-Compliance</ToggleButton>
									<ToggleButton value="true">Show Compliance</ToggleButton>	
								</ToggleButtonGroup> */}
							</Col>
							<Col md={4}>
								<Button variant="success" className="me-2" onClick={handleDownloadComplianceConversion}>
									Export to Excel
								</Button>
								{/* <Button variant="secondary" onClick={handlePrint}>
									Print
								</Button> */}
							</Col>
						</Col>
					</Row>

					{/* Search Filters */}
					<Row className="mb-3 bg-light py-2">
						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Location"
								name="location"
								value={filters.location}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Department"
								name="department"
								value={filters.department}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="CG Group"
								name="cgGroup"
								value={filters.group}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Global Code"
								name="globalCode"
								value={filters.globalCode}
								onChange={handleInputChange}
							/>
						</Col>
						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Company Name"
								name="company"
								value={filters.company}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Button
								variant="primary"
								onClick={() => setFilters({ ...filters })}
							>
								Search
							</Button>
						</Col>
					</Row>

					{/* DataTable Integration */}
					<DataTable
						title=""
						columns={complianceConversioncolumns}
						data={filteredData} // Use filtered data
						pagination
						highlightOnHover
						responsive
					/>
				</Card.Body>
			</Card>
			)}
			{(selectedTab === "EmployeeComplianceConversion") && (
			<Card className="mt-3">
				<Card.Body>
					{/* Header Row with Title & Buttons */}
					<Row className="mb-3 align-items-center">
						<Col md={6}>
							<h5 className="mb-0">Employee Compliance Conversion List</h5>
							<span style={{ fontSize: "13px" }}>This list will be updated by payroll team thrice a month i.e. 10th, 20th & last working day of the month.</span>
						</Col>						
						<Col md={6} className="d-flex justify-content-end">
							<Col md={4} className="me-2"></Col>
							<Col md={4} className="me-2">
								{/* <ToggleButtonGroup type="radio" name="options" value={isCompliance.toString()} onChange={(e) => handleComplianceChange(e.target.value)}>
									<ToggleButton value="false">Show Non-Compliance</ToggleButton>
									<ToggleButton value="true">Show Compliance</ToggleButton>	
								</ToggleButtonGroup> */}
							</Col>
							<Col md={4}>
								<Button variant="success" className="me-2" onClick={handleDownloadComplianceConversion}>
									Export to Excel
								</Button>
								{/* <Button variant="secondary" onClick={handlePrint}>
									Print
								</Button> */}
							</Col>
						</Col>
					</Row>

					{/* Search Filters */}
					<Row className="mb-3 bg-light py-2">
						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Location"
								name="location"
								value={filters.location}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Department"
								name="department"
								value={filters.department}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="CG Group"
								name="cgGroup"
								value={filters.group}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Global Code"
								name="globalCode"
								value={filters.globalCode}
								onChange={handleInputChange}
							/>
						</Col>
						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Company Name"
								name="company"
								value={filters.company}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Button
								variant="primary"
								onClick={() => setFilters({ ...filters })}
							>
								Search
							</Button>
						</Col>
					</Row>

					{/* DataTable Integration */}
					<DataTable
						title=""
						columns={complianceConversioncolumns}
						data={filteredData} // Use filtered data
						pagination
						highlightOnHover
						responsive
					/>
				</Card.Body>
			</Card>
			)}
			{(selectedTab === "ROComplianceConversion") && (
			<Card className="mt-3">
				<Card.Body>
					{/* Header Row with Title & Buttons */}
					<Row className="mb-3 align-items-center">
						<Col md={6}>
							<h5 className="mb-0">RO Compliance Conversion List</h5>
							<span style={{ fontSize: "13px" }}>This list will be updated by payroll team once a month before TVP release.</span>
						</Col>						
						<Col md={6} className="d-flex justify-content-end">
							<Col md={4} className="me-2"></Col>
							<Col md={4} className="me-2">
								{/* <ToggleButtonGroup type="radio" name="options" value={isCompliance.toString()} onChange={(e) => handleComplianceChange(e.target.value)}>
									<ToggleButton value="false">Show Non-Compliance</ToggleButton>
									<ToggleButton value="true">Show Compliance</ToggleButton>	
								</ToggleButtonGroup> */}
							</Col>
							<Col md={4}>
								<Button variant="success" className="me-2" onClick={handleDownloadComplianceConversion}>
									Export to Excel
								</Button>
								{/* <Button variant="secondary" onClick={handlePrint}>
									Print
								</Button> */}
							</Col>
						</Col>
					</Row>

					{/* Search Filters */}
					<Row className="mb-3 bg-light py-2">
						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Location"
								name="location"
								value={filters.location}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Department"
								name="department"
								value={filters.department}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="CG Group"
								name="cgGroup"
								value={filters.group}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Global Code"
								name="globalCode"
								value={filters.globalCode}
								onChange={handleInputChange}
							/>
						</Col>
						<Col md={2}>
							<Form.Control
								type="text"
								placeholder="Company Name"
								name="company"
								value={filters.company}
								onChange={handleInputChange}
							/>
						</Col>

						<Col md={2}>
							<Button
								variant="primary"
								onClick={() => setFilters({ ...filters })}
							>
								Search
							</Button>
						</Col>
					</Row>

					{/* DataTable Integration */}
					<DataTable
						title=""
						columns={complianceConversioncolumns}
						data={filteredData} // Use filtered data
						pagination
						highlightOnHover
						responsive
					/>
				</Card.Body>
			</Card>
			)}

			<Modal show={showModal} onHide={handleCloseEmployeeDetailsModal} size="xl">
				<Modal.Header closeButton>
					<Modal.Title>{modalTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>{modalContent}</Modal.Body>
			</Modal>
		</div>
	);
}

export default HrPage;
