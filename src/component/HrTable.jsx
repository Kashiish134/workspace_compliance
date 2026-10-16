import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Button, Card, Table, Modal } from "react-bootstrap";
import { FaTachometerAlt } from "react-icons/fa"; // Dashboard Icon

function HrTable() {
  const [weeklyCount, setWeeklyCount] = useState(4); // Weekly Counter Example

  // Modal visibility state
  const [showModal, setShowModal] = useState(false);

  // Define dynamic table data
  const tableData = [
    {
      id: 1,
      name: "Mukesh Sharma",
      link: "link here",
      selfAck: "Self",
      roAck: "Ro",
    },
    {
      id: 2,
      name: "Suresh Sapra",
      link: "link here",
      selfAck: "Self",
      roAck: "Ro",
    },
    {
      id: 3,
      name: "Ankita Mishra",
      link: "link here",
      selfAck: "Self",
      roAck: "Ro",
    },
  ];

  // Separate state for each checkbox type
  const [selfChecked, setSelfChecked] = useState(
    tableData.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );

  const [declarationChecked, setDeclarationChecked] = useState(
    tableData.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );

  // Handle Modal Open/Close
  const handleClarificationClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Handle Download Button Click
  const handleDownloadClick = () => {
    alert("Downloading HR data...");
    // You can replace this with actual file download logic
  };

  return (
    <div className="container">
      {/* Buttons */}
      <Row className="mb-2">
        <Col md={12} className="d-flex justify-content-end gap-2">
          <Button
            variant="dark"
            size="sm"
            className="weekly-monthly-btn"
            onClick={handleClarificationClick}
          >
            Download Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="download-btn"
            onClick={handleDownloadClick}
          >
            Self
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {/* Responsive Table */}
          <div className="table-responsive">
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Link</th>
                  <th className="text-center">Subject-1</th>
                  <th className="text-center">Subject-2</th>
                  <th className="text-center">
                    <Button variant="info" size="sm" className="self-btn">
                      Select All
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(({ id, name, link, selfAck, roAck }) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{name}</td>
                    <td>
                      <a href={`mailto:${link}`} className="text-primary">
                        {link}
                      </a>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center self-checkbox">
                        <span>{selfAck}</span>
                        <input
                          type="checkbox"
                          checked={selfChecked[id]}
                          onChange={() =>
                            setSelfChecked({
                              ...selfChecked,
                              [id]: !selfChecked[id],
                            })
                          }
                        />
                        <span>{roAck}</span>
                        <input
                          type="checkbox"
                          checked={selfChecked[id]}
                          onChange={() =>
                            setSelfChecked({
                              ...selfChecked,
                              [id]: !selfChecked[id],
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center self-checkbox">
                        <span>{selfAck}</span>
                        <input
                          type="checkbox"
                          checked={selfChecked[id]}
                          onChange={() =>
                            setSelfChecked({
                              ...selfChecked,
                              [id]: !selfChecked[id],
                            })
                          }
                        />
                        <span>{roAck}</span>
                        <input
                          type="checkbox"
                          checked={selfChecked[id]}
                          onChange={() =>
                            setSelfChecked({
                              ...selfChecked,
                              [id]: !selfChecked[id],
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={declarationChecked[id]}
                        onChange={() =>
                          setDeclarationChecked({
                            ...declarationChecked,
                            [id]: !declarationChecked[id],
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* Approved Button Below Table (Right-Aligned) */}
          <Row className="mt-3">
            <div className="d-flex justify-content-end   gap-2">
              <Button variant="success" size="sm">
                Approve
              </Button>
              <Button variant="danger" size="sm">
                Cancel
              </Button>
            </div>
          </Row>
        </Card.Body>
      </Card>

      {/* Clarification Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header className="p-0 py-2 px-3" closeButton>
          <Modal.Title>Clarification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter the clarification details here...</p>
        </Modal.Body>
        <Modal.Footer className="p-0 py-1 px-2">
          <Button variant="secondary" size="sm" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleCloseModal}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom Styles */}
      <style>
        {`
          .weekly-monthly-btn, .download-btn {
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

          .d-flex.align-items-center {
            gap: 8px;
          }

          a.text-primary {
            text-decoration: none;
            font-weight: bold;
          }

          a.text-primary:hover {
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
}

export default HrTable;
