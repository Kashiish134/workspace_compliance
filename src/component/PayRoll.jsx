import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Button, Card, Modal, Form, Table, Tabs, Tab } from "react-bootstrap";
import { FaUser, FaUsers, FaTachometerAlt, FaFilePdf, FaInfoCircle } from "react-icons/fa"; // Import PDF icon
import DataTable from "react-data-table-component";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { apiCall } from "../api/apiUtil";

function Payroll() {
	const [globalCode, setGlobalCode] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	const [pendingCount, setPendingCount] = useState(0);
	const [nonComplianceCount, setNonComplianceCount] = useState(0);
	const [actionProgramButtonDisabled, setActionProgramButtonDisabled] = useState(false);
	const [complianceCount, setComplianceCount] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedMonth, setSelectedMonth] = useState(new Date()); // State for month filter
	const [showROModal, setShowROModal] = useState(false);
	const [isCompliance, setIsCompliance] = useState(false);
	const [selectedROComments, setSelectedROComments] = useState("");
	const [tableData, setTableData] = useState([]);

	const [selectedTab, setSelectedTab] = useState("EmployeeNonCompliance");

	const [jobHistory, setJobHistory] = useState([]);
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [modalTitle, setModalTitle] = useState("");
	const [modalContent, setModalContent] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		//console.log("Global Code", sessionStorage.getItem("globalCode"));
		let globalCode = sessionStorage.getItem("globalCode");
		if(globalCode) {
			setGlobalCode(sessionStorage.getItem("globalCode"));
			setUserRoles(JSON.parse(sessionStorage.getItem("userRoles")));
			getEmployeeComplianceMonthlyFinal();
		} else {
			navigate("/");
		}
	}, [navigate]);

	useEffect(() => {
		// setNonComplianceCount(0);
		// setComplianceCount(0);
		if(selectedTab == "EmployeeNonCompliance") {
			getEmployeeComplianceMonthlyFinal();
		} else if(selectedTab == "EmployeeComplianceConversion") {
			getEmployeeComplianceConversion();
		} else if(selectedTab == "RONonCompliance") {
			getROComplianceMonthlyFinal();
		} else if(selectedTab == "ROComplianceConversion") {
			getROComplianceConversion();
		}
	}, [selectedMonth, selectedTab, isCompliance, userRoles]);

	const getEmployeeComplianceMonthlyFinal = () => {
		if(Array.isArray(userRoles)) {
			let filter = {
				year: moment(selectedMonth).format("YYYY"),
				month: moment(selectedMonth).format("M"),
				orgUnits: [...new Set(userRoles.map(item => item.orgUnit).filter(e => e !== null && e !== undefined))],
				companyNames: [...new Set(userRoles.map(item => item.companyName).filter(e => e !== null && e !== undefined))],
				locationNames: [...new Set(userRoles.map(item => item.locationName).filter(e => e !== null && e !== undefined))],
			}
			apiCall("/EmployeeComplianceMonthlyFinal/GetEmployeeNonComplianceListByMonth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(filter),
			})
			.then((data) => {
				//console.log("Backend Response:", data);
				if (data.success) {
					setTableData(data.employees);
					setNonComplianceCount(data?.summary?.nonCompliancedEmployee ?? 0);
					setComplianceCount(data?.summary?.compliancedEmployee ?? 0);
				} else {				
					alert(data.message);
				}
			})
			.catch((err) => {
				alert(err);
				console.error("Error:", err);
			});
		}
	};

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
					setTableData(data.employees);
					setNonComplianceCount(data?.summary?.nonCompliancedEmployee ?? 0);
					setComplianceCount(data?.summary?.compliancedEmployee ?? 0);
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

	const getROComplianceMonthlyFinal = () => {
		if(Array.isArray(userRoles)) {
			let filter = {
				year: moment(selectedMonth).format("YYYY"),
				month: moment(selectedMonth).format("M"),
				orgUnits: [...new Set(userRoles.map(item => item.orgUnit).filter(e => e !== null && e !== undefined))],
				companyNames: [...new Set(userRoles.map(item => item.companyName).filter(e => e !== null && e !== undefined))],
				locationNames: [...new Set(userRoles.map(item => item.locationName).filter(e => e !== null && e !== undefined))],
			}
			apiCall("/EmployeeComplianceMonthlyFinal/GetRONonComplianceListByMonth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(filter),
			})
			.then((data) => {
				//console.log("Backend Response:", data);
				if (data.success) {
					setTableData(data.employees);
					setNonComplianceCount(data?.summary?.nonCompliancedEmployee ?? 0);
					setComplianceCount(data?.summary?.compliancedEmployee ?? 0);
				} else {				
					alert(data.message);
				}
			})
			.catch((err) => {
				alert(err);
				console.error("Error:", err);
			});
		}
	};

	const getROComplianceConversion = () => {
		if(Array.isArray(userRoles)) {
			let filter = {
				orgUnits: [...new Set(userRoles.map(item => item.orgUnit).filter(e => e !== null && e !== undefined))],
				companyNames: [...new Set(userRoles.map(item => item.companyName).filter(e => e !== null && e !== undefined))],
				locationNames: [...new Set(userRoles.map(item => item.locationName).filter(e => e !== null && e !== undefined))],
			}
			apiCall("/EmployeeComplianceMonthlyFinal/GetROComplianceConversionsList", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(filter),
			})
			.then((data) => {
				//console.log("Backend Response:", data);
				if (data.success) {
					setTableData(data.employees);
					setNonComplianceCount(data?.summary?.nonCompliancedEmployee ?? 0);
					setComplianceCount(data?.summary?.compliancedEmployee ?? 0);
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

	const handleJobHistory = async() => {
		setJobHistory([]);
		let jobHistory = await apiCall("/BackgroundJobActionSchedule", {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});
		setJobHistory(jobHistory ?? []);
		setModalTitle("Job Running History");
		setModalContent(
			<>
				<Table striped bordered hover size="sm">
					<thead>
						<tr>
							<th>Background Job Code</th>
							<th>Description</th>
							<th>Started On</th>
							<th>Completed On</th>
							<th>Status</th>
							<th>Scheduled By</th>
							<th>Added On</th>
							<th>Updated On</th>
						</tr>
					</thead>
					<tbody>
						{jobHistory.length > 0 ? (
						jobHistory.map((record, index) => (
							<tr key={index}>
								<td>{record?.backgroundJobCode}</td>
								<td style={{textWrap: "auto"}}>{record?.backgroundJobDesc}</td>
								<td>{(record?.startedOn != null) ? moment(record?.startedOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
								<td>{(record?.completedOn != null) ? moment(record?.completedOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
								<td>{(record?.isProcessed != null) ? ((record?.isProcessed == false) ? "In Process" : "Completed") : "Pending"}</td>
								<td>{record?.scheduledBy}</td>
								<td>{(record?.addedOn != null) ? moment(record?.addedOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
								<td>{(record?.updatedOn != null) ? moment(record?.updatedOn).format("DD/MMM/YYYY HH:mm") : "-"}</td>
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
	const saveBackgroundAction = async() => {
		setActionProgramButtonDisabled(true);
		
		let backgroundJobCode = "";
		let backgroundJobDesc = "";
		switch(selectedTab) {
			case "EmployeeNonCompliance":
				backgroundJobCode = "RunEmployeeHold";
				backgroundJobDesc = "Run Employee Hold Program By Payroll Team";
				break;
			case "EmployeeComplianceConversion":
				backgroundJobCode = "RunEmployeeRelease";
				backgroundJobDesc = "Run Employee Release Program By Payroll Team";
				break;
			case "RONonCompliance":
				backgroundJobCode = "RunROHold";
				backgroundJobDesc = "Run RO Hold Program By Payroll Team";
				break;
			case "ROComplianceConversion":
				backgroundJobCode = "RunRORelease";
				backgroundJobDesc = "Run RO Release Program By Payroll Team";
				break;
		}
		let actionSchedule = {
			BackgroundJobCode: backgroundJobCode,
			BackgroundJobDesc: backgroundJobDesc,
			ScheduledBy: globalCode
		};
		apiCall("/BackgroundJobActionSchedule", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(actionSchedule),
		})
		.then((data) => {
			//console.log("Backend Response:", data);
			if (data?.id > 0) {
				alert("Please check the job history for acknolwledgement of long running scheduling job.");
			} else {				
				alert("Some error occur during background job scheduling.");
			}
			setActionProgramButtonDisabled(false);
		})
		.catch((err) => {
			alert(err);
			console.error("Error:", err);
			setActionProgramButtonDisabled(false);
		});
	};
	const handleDownload = () => {
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

	const handlePrint = () => {
		window.print();
	};

	const handleShowModal = (category) => {
		setSelectedCategory(category);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleMonthChange = (e) => {
		setSelectedMonth(e.target.value);
	};

	const handleShowROModal = (comments) => {
		setSelectedROComments(comments);
		setShowROModal(true);
	};

	const handleCloseROModal = () => {
		setShowROModal(false);
	};

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

	const customStyles = {
		headCells: {
			style: {
				backgroundColor: "#6e6c6c", // Dark background color
				color: "white", // White text color
				fontSize: "12px",
				fontWeight: "bold",
				textAlign: "center",
				padding: "10px",
			},
		},
		cells: {
			style: {
				textAlign: "center",
				fontSize: "14px",
				padding: "8px",
			},
		},
	};

	return (
		<div className="container mt-3 mb-3 d-flex flex-column min-vh-100">
			<h5 className="mb-3">
				<FaTachometerAlt className="me-2" /> Payroll Dashboard
			</h5>
			<Row className="mb-3">
				<Col md={12} className="d-flex align-items-center">
					<Col md={3} className="me-2">
						<label className="align-items-center mt-2">Payroll Month</label>
						<DatePicker selected={selectedMonth} onChange={(date) => setSelectedMonth(date)} dateFormat="MMMM yyyy" showMonthYearPicker className="form-control" />
						<span style={{fontSize: "13px", color: "red"}}>24th of {moment(selectedMonth).subtract(1, "M").format("MMMM YYYY")} to 23rd of {moment(selectedMonth).format("MMMM YYYY")}</span>
					</Col>
					<Col md={9} className="d-flex justify-content-end">
						<Button variant="warning" size="sm" className="me-2">
							Non-Compliance{" "}
							<span className="badge bg-light text-dark ms-2">
								{nonComplianceCount}
							</span>
						</Button>
						<Button variant="success" size="sm" className="me-2">
							Compliance{" "}
							<span className="badge bg-light text-dark ms-2">
								{complianceCount}
							</span>
						</Button>
						<a href="/user-dashboard" className="me-2">
							<Button variant="info" size="sm">
								<FaUser className="me-2" /> Self Review
							</Button>
						</a>

						{Array.isArray(userRoles) && userRoles.some(role => role.role === "RO") && (
							<a href="/ro-dashboard" className="me-2">
								<Button variant="info" size="sm">
									<FaUsers className="me-2" /> Team Review
								</Button>
							</a>
						)}

						{Array.isArray(userRoles) && userRoles?.some(role => role.role === "HR Head") && (
							<a href="/hr-dashboard" className="me-3">
								<Button variant="info" size="sm">
									<FaUser className="me-2" /> Location HR View
								</Button>
							</a>
						)}
					</Col>
				</Col>
			</Row>
			<Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} className="mb-3">
				<Tab eventKey="EmployeeNonCompliance" title="Employee Non-Compliance HOLD View" />
				<Tab eventKey="EmployeeComplianceConversion" title="Employee Compliance Conversion" />
				<Tab eventKey="RONonCompliance" title="RO Non-Compliance HOLD View" />
				<Tab eventKey="ROComplianceConversion" title="RO Compliance Conversion" />
			</Tabs>
			<Row className="mb-2 align-items-center">
				<Col md={6}>
					{(selectedTab == "EmployeeNonCompliance") && (
						<>
							<h5 className="mb-0">Non Compliance HOLD Employees</h5>
							<span style={{ fontSize: "13px" }}>HOLD summary will show after action taken by Payroll team at last working day of the month.</span>
						</>
					)}
					{(selectedTab == "EmployeeComplianceConversion") && (
						<>
							<h5 className="mb-0">Compliance Conversion Employees</h5>
							<span style={{ fontSize: "13px" }}>This list will be updated by payroll team thrice a month i.e. 10th, 20th & last working day of the month.</span>
						</>
					)}
					{(selectedTab == "RONonCompliance") && (
						<>
							<h5 className="mb-0">Non Compliance HOLD ROs</h5>
							<span style={{ fontSize: "13px" }}>This list will be updated by payroll team before TVP release.</span>
						</>
					)}
					{(selectedTab == "ROComplianceConversion") && (
						<>
							<h5 className="mb-0">Compliance Conversion ROs</h5>
							<span style={{ fontSize: "13px" }}>This list will be updated by payroll team before TVP release.</span>
						</>
					)}
				</Col>
				<Col md={6} className="d-flex justify-content-end">
					<Button variant="primary" size="sm" className="me-2" onClick={handleJobHistory}>
						Job History
					</Button>
					<Button variant="warning" size="sm" className="me-2" onClick={saveBackgroundAction} disabled={actionProgramButtonDisabled}>
						{(selectedTab == "EmployeeNonCompliance") && (<>Run Employee Hold Program</>)}
						{(selectedTab == "EmployeeComplianceConversion") && (<>Run Employee Release Program</>)}
						{(selectedTab == "RONonCompliance") && (<>Run RO Hold Program</>)}
						{(selectedTab == "ROComplianceConversion") && (<>Run RO Release Program</>)}
					</Button>
					<Button variant="info" size="sm" className="me-2" onClick={handleDownload}>
						Export to Excel
					</Button>
				</Col>
			</Row>

			<Card className="">
				<Card.Body>
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
					<Modal show={showROModal} onHide={handleCloseROModal}>
						<Modal.Header closeButton>
							<Modal.Title>RO Comments Details</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>
								Selected RO Comment: <strong>{selectedROComments}</strong>
							</p>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleCloseROModal}>
								Close
							</Button>
						</Modal.Footer>
					</Modal>

					<Modal show={showModal} onHide={handleCloseModal}>
						<Modal.Header closeButton>
							<Modal.Title>Category Details</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>
								You clicked on category: <strong>{selectedCategory}</strong>
							</p>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleCloseModal}>
								Close
							</Button>
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

					<DataTable
						columns={columns}
						data={filteredData}
						pagination
						highlightOnHover
						responsive
						customStyles={customStyles} // Apply custom styles
					/>
				</Card.Body>
			</Card>
		</div>
	);
}

export default Payroll;
