import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { Row, Col, Image } from "react-bootstrap";
import Jindal_logo from "../Images/Jindal_logo.png";

function Header_Top() {
  return (
    <div className="container-fluid bg-light">
      <Navbar expand="lg" className="bg-body-tertiary"></Navbar>
    </div>
  );
}

export default Header_Top;
