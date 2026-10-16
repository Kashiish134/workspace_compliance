import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../api/apiUtil";

const GoogleAuth = () => {
    const clientId = "788913269048-embio91c5dgntndfd675pfksjarbag0c.apps.googleusercontent.com";
    const navigate = useNavigate();

    useEffect(() => {
        const initializeGoogle = () => {
            /* global google */
            //if(window.google) {
                //console.log("Google SDK initialized");
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                });

                google.accounts.id.renderButton(
                    document.getElementById("signInDiv"), // The container element
                    {
                        theme: "outline",
                        size: "large",
                    }
                );

                // Optional: Auto sign-in if the user is already logged in
                google.accounts.id.prompt();
            //};
        }

        if (window.google) {
            initializeGoogle();
        } else {
            const checkGoogle = setInterval(() => {
                    if (window.google) {
                        clearInterval(checkGoogle);
                        initializeGoogle();
                    }
                }, 500);
        }
        //initializeGoogle();

        // if (document.readyState === "complete") {
        //     initializeGoogle();
        // } else {
        //     window.addEventListener("load", initializeGoogle);
        // }
    
        // return () => {
        //     window.removeEventListener("load", initializeGoogle);
        // };
    }, [navigate]);
        

    const handleCredentialResponse = (response) => {
        //console.log("Encoded JWT ID token: " + JSON.stringify(response));
        sessionStorage.setItem("userToken", response.credential);
        apiCall("/EmployeeDetail/ValidateToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.credential }),
        })
        .then((data) => {
            //console.log("Backend Response:", data);
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

    return null;
};

export default GoogleAuth;
