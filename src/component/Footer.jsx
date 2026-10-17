import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import Container from "react-bootstrap/Container";
import { Row } from "react-bootstrap";
import "./Footer.css"; // Import custom CSS for marquee

const Footer = () => {
  return (
    <footer className="text-white py-1" style={{ backgroundColor: "#636466" }}>
      <Container>
        <Row>
          <p className="mb-0 text-end text-light">
            <a href="https://jindalsteel.com/privacy-policy.html" className="text-light" target="blank">Privacy Policy</a> &nbsp; &nbsp; | &nbsp; &nbsp;
            <a href="https://jindalsteel.com/terms-of-service.html" className="text-light" target="blank">Terms of Service</a> &nbsp; &nbsp; | &nbsp; &nbsp;
            &copy; Jindal Steel & Power Limited
          </p>
        </Row>
        {/* Horizontal Line and Copyright Text */}
      </Container>
    </footer>
  );
};

export default Footer;
