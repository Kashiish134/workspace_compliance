import React, { PureComponent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export class FaqsDashboard extends PureComponent {
	render() {
		return (
			<div className="container p-5">
				<h5 style={{ fontWeight: "bold" }}>Q1: How to log in to the system?</h5>
				<ol>
					<li>
						Open <strong>jsplconnect.jindalsteel.com</strong> in your browser.
					</li>
					<li>
						Navigate to <strong>“Web Portals”</strong> in the{" "}
						<strong>Top Menu Bar.</strong>
					</li>
					<li>
						In the <strong>“HR & ADMIN”</strong> section, click on the{" "}
						<strong>4th card</strong> labeled
						<strong>“Workspace Compliance”</strong>.
					</li>
					<li>You will be redirected to the Login Page.</li>
					<li>
						Log in using one of the following methods:
						<ul style={{ paddingLeft: "20px" }}>
							<li>
								<strong>HRMS User ID & Password</strong>
							</li>
							<li>
								<strong>Single Sign-On (SSO)</strong> through your official
								email ID (refresh the page if singlesign on option not viewed)
								You will then be directed to your personal{" "}
								<strong>dashboard</strong>
							</li>
						</ul>
					</li>
				</ol>
				<h5 style={{ fontWeight: "bold" }}>
					Q2: Why my weekly 411 showing “Pending To Declare” ?
				</h5>
				<ol>
					<li>
						Your <strong>411 status</strong> is synced to this system{" "}
						<strong>twice a day</strong> at <strong>1 PM and 9 PM.</strong>
						Here are the possible reasons why your status is still showing as
						<strong>"Pending To Declare"</strong>.
					</li>
					<li>
						<strong>Improper Format:</strong> If your 411 was not updated in the
						correct format, the status will not change.
					</li>
					<li>
						<strong>Sync Timing:</strong>
						<ul style={{ paddingLeft: "20px" }}>
							<li>
								If you updated your 411 <strong>before 12 noon,</strong> it will
								be reflected in the system by <strong>1 PM.</strong>
							</li>
							<li>
								If you updated your 411 <strong>after 12 noon,</strong> it will
								be updated by <strong>9 PM.</strong>
							</li>
						</ul>
					</li>

					<li>
						<strong>No Update After 24 Hours:</strong> If your status remains
						unchanged <strong>even after 24 hours</strong> of updating the
						Google Sheet, you can manually upload evidence by clicking on the
						<strong>“Pending To Declare” button.</strong>
					</li>
				</ol>

				<h5 style={{ fontWeight: "bold" }}>
					Q3: Why is my 411 status showing “Declared” and RO Status showing
					“Pending For Review” ?
				</h5>
				<p>
					Your <strong>411 status</strong> has been successfully synced with the
					system. However, your <strong>Reporting Officer (RO)</strong> still
					needs to review it.
				</p>
				<ol>
					<li>
						Both <strong>you and your RO</strong> are responsible for ensuring
						timely review.
					</li>

					<li>
						If your RO is on leave, the review should be completed{" "}
						<strong>
							before the payroll cycle closes (23rd of every month)
						</strong>{" "}
						to avoid any delays.
					</li>
				</ol>

				<h5 style={{ fontWeight: "bold" }}>
					Q4: I am on leave. What should I do as a reportee ?
				</h5>
				<p>If you are on leave, please follow these steps:</p>
				<ol>
					<li>
						Click on the link sent via email titled{" "}
						<strong>“I Am On Leave”</strong>.
					</li>
					<li>
						Select the appropriate <strong>leave type</strong>.
					</li>
					<li>
						Enter the <strong>date range</strong> for your leave.
					</li>
					<li>Submit the details to ensure proper record-keeping.</li>
					<li>
						This will ensure your leave is recorded correctly in the system.
					</li>
				</ol>

				<h5 style={{ fontWeight: "bold" }}>
					Q5: Why is my 411 status showing “On Leave” and RO Status showing
					“Pending For Review” ?
				</h5>
				<p>
					Your <strong>411 status</strong> has been successfully synced with
					your leave request. However, your{" "}
					<strong>Reporting Officer (RO) </strong>still needs to review and
					approve it.
				</p>
				<ol>
					<li>
						It is important that your RO reviews the status{" "}
						<strong>on time</strong>.
					</li>
					<li>
						The review must be completed
						<strong>
							{" "}
							before the payroll cycle closes (23rd of every month)
						</strong>{" "}
						to ensure accurate records.
					</li>
				</ol>

				<h5 style={{ fontWeight: "bold" }}>
					Q6: As an RO. How to review the 411 compliances of my reportees ?
				</h5>
				<p>
					To review the 411 compliance of your reportees, follow these steps:
				</p>
				<ol>
					<li>
						Click on the <strong>“Team Review”</strong> button on the dashboard
						post login into the portal.
					</li>
					<li>
						In the <strong>Self</strong> column, you can view the status of all
						your reportees.
					</li>
					<li>
						To review, click on the <strong>“Pending”</strong> button in the{" "}
						<strong>RO </strong>column for each week and against each individual
						reportee.
					</li>
					<li>
						<strong>You have the following review options:</strong>
						<ul style={{ paddingLeft: "20px" }}>
							<li>
								<strong>Reviewed</strong> – Select this if you agree with the
								411 submitted by your reportees or aligned with his/her leave |
								OD dates.
							</li>
							<li>
								<strong>Send Back</strong> – Select this if the 411 is incorrect
								or not filled as per JSP standards.
							</li>
							<li>
								<strong>Non-Compliance</strong> – Select this if the reportee
								has been repeatedly reminded but has not updated their 411 as
								per management’s guidelines or not aligned with the compliance..
							</li>
						</ul>
					</li>
				</ol>

				<h5 style={{ fontWeight: "bold" }}>
					Q7: Whom Should we connect for any Technical support ?
				</h5>

				<ol>
					<li>
						Visit{" "}
						<span style={{ color: "blue" }}>
							https://jsplconnect.jindalsteel.com/gps411.html
						</span>
					</li>
					:<li>Connect with the 411 champions wrt your locations</li>
				</ol>

				<h5 style={{ fontWeight: "bold" }}>
					Q8: How to be confirmed that I am 100% complied for this month ?
				</h5>

				<ol>
					<li>
						Ensure to visit the portal in a definite interval of time to
						validate the declaration of individual and approval of Report
						manager
					</li>
					<li>
						The Counter of <strong>“Total Compliance”</strong> and{" "}
						<strong>“Completed Compliance”</strong> should be same{" "}
					</li>
					<li>
						Ensure to check the compliance frequency (weekly /Monthly) and
						ensure the declaration{" "}
					</li>
				</ol>

				<h5 style={{ fontWeight: "bold" }}>
					Q9: If I missed the declaration in one financial month, what should I
					do ?
				</h5>

				<ol>
					<li>
						Ensure to concert all <strong>“NON COMPLIANCE”</strong> to{" "}
						<strong>“Reviewed”</strong>
					</li>
					<li>
						The Counter of <strong>“Total Compliance”</strong> and{" "}
						<strong>“Completed Compliance”</strong> should be same
					</li>
					<li>
						Ensure to check the compliance frequency (weekly /Monthly) and
						ensure the declaration to be completed before 23rd of the every
						month
					</li>
				</ol>
			</div>
		);
	}
}

export default FaqsDashboard;
