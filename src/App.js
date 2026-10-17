import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
import { isDemoMode, isSampleMode } from "./api/apiUtil";

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {isSampleMode() && (
        <div className="bg-warning text-dark text-center small py-1" data-testid="demo-banner">
          <b>{isDemoMode() ? "Demo mode" : "Sample API mode"}</b>: {isDemoMode() ? "in-browser sample data, no backend required. Signing out resets it." : "connected to the local backend (npm run server). POST /api/reset restores the original data."}
        </div>
      )}
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
