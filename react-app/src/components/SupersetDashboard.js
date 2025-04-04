import React, { useEffect, useRef } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import "./SupersetDashboard.css"; // We'll create this file

async function fetchGuestToken() {
  // N.B. This should be on the server side
  const loginResponse = await fetch(
    "http://localhost:8088/api/v1/security/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin",
        refresh: true,
        provider: "db",
      }),
    }
  );

  const loginResult = await loginResponse.json();
  const token = loginResult.access_token;

  const csrfResponse = await fetch(
    "http://localhost:8088/api/v1/security/csrf_token/",
    {
      method: "GET",
      credentials: "include", // Needed to set session cookie
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const csrfResult = await csrfResponse.json();
  const csrfToken = csrfResult.result;

  const guestResponse = await fetch(
    "http://localhost:8088/api/v1/security/guest_token/",
    {
      method: "POST",
      credentials: "include", // Needed to get CSRF session cookie
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        user: {
          username: "guest",
          first_name: "Guest",
          last_name: "User",
        },
        rls: [],
        resources: [
          {
            type: "dashboard",
            id: "93e22ad0-e4a6-4fef-a805-6e17714ba868",
          },
        ],
      }),
    }
  );
  const guestResult = await guestResponse.json();
  const guestToken = guestResult.token;

  return guestToken;
}

function SupersetDashboard() {
  const containerRef = useRef(null);

  useEffect(() => {
    const embed = async () => {
      try {
        console.log("Attempting to embed dashboard...");

        await embedDashboard({
          id: "93e22ad0-e4a6-4fef-a805-6e17714ba868", // Original dashboard ID
          supersetDomain: "http://localhost:8088",
          mountPoint: containerRef.current,
          fetchGuestToken: fetchGuestToken,
          dashboardUiConfig: {
            hideTitle: false,
            hideTab: false,
            hideChartControls: false,
            filters: {
              expanded: false,
            },
            urlParams: {
              standalone: 3, // Removes all menus on dashboard
            },
          },
        });

        console.log("Dashboard embedded successfully");
      } catch (error) {
        console.error("Error embedding dashboard:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
    };

    embed();
  }, []);

  return (
    <div
      ref={containerRef}
      className="dashboard-container"
      style={{ height: "100vh" }}
    />
  );
}

export default SupersetDashboard;
