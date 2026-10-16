import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Home from "./pages/Home.jsx";
import RoDashboard from "./pages/RoDashboard";
import HrDashboard from "./pages/HrDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import PayrollDashboard from "./pages/PayrollDashboard.jsx";
import FaqsPage from "./pages/FaqsPage.jsx";

import Footer from "./component/Footer.jsx";
import NavbarComponent from "./component/NavbarComponent.jsx";
import LoginPage from "./component/LoginPage.jsx";
import Login from "./pages/Login.jsx";
import GoogleAuth from "./component/GoogleAuth";

const App = () => {
  return (
    <BrowserRouter>
      <NavbarComponent />
      <div className="">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/ro-dashboard" element={<RoDashboard />} />
          <Route path="/Hr-dashboard" element={<HrDashboard />} />
          <Route path="/payroll-dashboard" element={<PayrollDashboard />} />
          <Route path="/faqs-page" element={<FaqsPage />} />

          <Route path="/login" element={<Login />} />
        </Routes>

        <Footer></Footer>
        <GoogleAuth />
      </div>
    </BrowserRouter>
  );
};

export default App;
