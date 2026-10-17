import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiCall, isSampleMode } from "../api/apiUtil";

// Public OAuth client ID (not a secret). Override with REACT_APP_GOOGLE_CLIENT_ID for your own domain.
const CLIENT_ID =
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    "788913269048-embio91c5dgntndfd675pfksjarbag0c.apps.googleusercontent.com";

// google.accounts.id.initialize() must only run once per page load.
let googleInitialized = false;

const GoogleAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Sample data modes have no Google sign-in (the sample backend can't validate real Google tokens).
        if (isSampleMode()) return undefined;

        const handleCredentialResponse = (response) => {
            sessionStorage.setItem("userToken", response.credential);
            apiCall("/EmployeeDetail/ValidateToken", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: response.credential }),
            })
            .then((data) => {
                if (data.success) {
                    sessionStorage.setItem("globalCode", data?.user?.globalCode);
                    sessionStorage.setItem("userEmail", data?.user?.emailId);
                    sessionStorage.setItem("userName", data?.user?.name);
                    sessionStorage.setItem("roGlobalCode", data?.user?.roGlobalCode);
                    sessionStorage.setItem("roEmail", data?.user?.roEmail);
                    navigate("/user-dashboard"); // Navigate to dashboard using React Router
                }
            })
            .catch((err) => {
                alert(err);
                console.error("Error:", err);
            });
        };

        const setup = () => {
            const google = window.google;
            if (!googleInitialized) {
                google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: handleCredentialResponse,
                });
                googleInitialized = true;
            }
            // The sign-in button exists only on the login page.
            const container = document.getElementById("signInDiv");
            if (container) {
                google.accounts.id.renderButton(container, { theme: "outline", size: "large" });
                google.accounts.id.prompt(); // one-tap prompt, login page only
            }
        };

        if (window.google) {
            setup();
            return undefined;
        }
        // The GSI script loads asynchronously; wait for it.
        const timer = setInterval(() => {
            if (window.google) {
                clearInterval(timer);
                setup();
            }
        }, 500);
        return () => clearInterval(timer);
    }, [navigate, location.pathname]);

    return null;
};

export default GoogleAuth;
