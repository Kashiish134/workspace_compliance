import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Button, Card, Tabs, Tab } from "react-bootstrap";
import { FaTachometerAlt } from "react-icons/fa"; // Dashboard Icon
import HrTable from "../component/HrTable";

function LocationHr() {
  const [checkedItems, setCheckedItems] = useState({
    1: false,
    2: false,
    3: false,
  });

  // Toggle individual checkboxes
  const handleCheckboxChange = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle Download button click
  const handleDownloadClick = () => {
    // You can replace this logic with an actual file download logic
    alert("Downloading data...");
  };

  return (
    <div className="container mt-3 mb-3">
      {/* Dashboard Title with Icon */}
      <h5 className="mb-3">
        <FaTachometerAlt className="me-2" /> Location HR Dashboard
      </h5>

      {/* Tabs */}
      <Tabs defaultActiveKey="tab1" id="locationHrTabs" className="mb-1">
        {/* First Tab */}
        <Tab eventKey="tab1" title="Tab-1">
          <Card className="mt-0">
            <Card.Body>
              <h6>
                <HrTable />
              </h6>
              {/* You can add your tab-specific content here */}
            </Card.Body>
          </Card>
        </Tab>

        {/* Second Tab */}
        <Tab eventKey="tab2" title="Tab 2">
          <Card className="mt-3">
            <Card.Body>
              <h6>Tab 2 Content</h6>
              {/* Add content for the second tab */}
            </Card.Body>
          </Card>
        </Tab>

        {/* Third Tab */}
        <Tab eventKey="tab3" title="Tab 3">
          <Card className="mt-3">
            <Card.Body>
              <h6>Tab 3 Content</h6>
              {/* Add content for the third tab */}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Custom Styles */}
      <style>
        {`
          .download-btn {
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
        `}
      </style>
    </div>
  );
}

export default LocationHr;
