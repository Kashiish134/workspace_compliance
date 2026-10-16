import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Row,
  Col,
  Button,
  Card,
  Table,
  Form,
  Container,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaTachometerAlt } from "react-icons/fa"; // Dashboard Icon

function Dashboard() {
  const navigate = useNavigate();

  const [complianceCount, setComplianceCount] = useState(6);
  const [completedCount, setCompletedCount] = useState(2);
  const [pendingCount, setPendingCount] = useState(4);
  const [pendingClarificationCount, setPendingClarificationCount] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  // Function to handle modal opening
  const handleShowModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);
  };

  // Checkbox State
  const [selfDeclarationChecked, setSelfDeclarationChecked] = useState(false);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Handle File Upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files); // Convert FileList to an array
    setUploadedFiles(files);
  };

  // Handle Submit
  const handleSubmit = () => {
    console.log("Self Declaration Checked:", selfDeclarationChecked);
    console.log(
      "Uploaded File:",
      uploadedFile ? uploadedFile.name : "No file uploaded"
    );

    alert("Form submitted successfully!");
  };

  // Handle Cancel (Reset Fields)
  const handleCancel = () => {
    setSelfDeclarationChecked(false);
    setUploadedFiles([]);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Main Content */}
      <Container className="flex-grow-1 mt-3 mb-3">
        {/* Dashboard Title with Icon */}
        <h5 className="mb-3">
          <FaTachometerAlt className="me-2" /> Employee Dashboard
        </h5>

        {/* Compliance Buttons */}
        <Row className="mb-3">
          <Col md={12} className="d-flex justify-content-end">
            <Button
              variant="primary"
              size="sm"
              className="weekly-monthly-btn me-2"
              onClick={() =>
                handleShowModal(
                  "Total Compliance",
                  `Total Compliance Count: ${complianceCount}`
                )
              }
            >
              Total Compliance{" "}
              <span className="badge bg-light text-dark ms-2">
                {complianceCount}
              </span>
            </Button>

            <Button
              variant="success"
              size="sm"
              className="weekly-monthly-btn me-2"
              onClick={() =>
                handleShowModal(
                  "Completed",
                  `Completed Tasks: ${completedCount}`
                )
              }
            >
              Completed{" "}
              <span className="badge bg-light text-dark ms-2">
                {completedCount}
              </span>
            </Button>

            <Button
              variant="warning"
              size="sm"
              className="weekly-monthly-btn me-2"
              onClick={() =>
                handleShowModal("Pending", `Pending Tasks: ${pendingCount}`)
              }
            >
              Pending{" "}
              <span className="badge bg-light text-dark ms-2">
                {pendingCount}
              </span>
            </Button>

            <Button
              variant="danger"
              size="sm"
              className="weekly-monthly-btn me-3"
              onClick={() =>
                handleShowModal(
                  "Pending Clarification",
                  `Pending Clarifications: ${pendingClarificationCount}`
                )
              }
            >
              Pending Clarification{" "}
              <span className="badge bg-light text-dark ms-2">
                {pendingClarificationCount}
              </span>
            </Button>
          </Col>
        </Row>

        {/* Employee Table Card */}
        <Card>
          <Card.Body>
            {/* Responsive Table */}
            <div className="table-responsive">
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>Category 1</th>
                    <th className="text-center">Self Declaration</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Category name here</td>
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={selfDeclarationChecked}
                        onChange={(e) =>
                          setSelfDeclarationChecked(e.target.checked)
                        }
                      />
                    </td>
                    <td>
                      {/* File Upload Input (Allow Multiple Files) */}
                      <Form.Control
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                      />

                      {/* Show Uploaded Files */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="mb-2">
                              <span className="text-success">{file.name}</span>{" "}
                              {file.type.startsWith("image") && (
                                <a
                                  href={URL.createObjectURL(file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ms-2"
                                >
                                  View
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="d-flex justify-content-end mt-3">
              <Button
                variant="danger"
                size="sm"
                className="me-2"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button variant="success" size="sm" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Modal Component */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
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
      </Container>

      {/* Custom Styles */}
      <style>
        {`
          .weekly-monthly-btn {
            font-size: 12px;  
            padding: 5px 15px;
            border-radius: 6px;
            min-width: 120px;
            text-align: center;
          }

          .badge {
            font-size: 10px;
            padding: 2px 6px;
          }

          .counter-card {
            text-align: center;
          }

          footer {
            position: relative;
            width: 100%;
          }
        `}
      </style>
    </div>
  );
}

export default Dashboard;
