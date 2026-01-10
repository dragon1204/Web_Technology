import React from "react";
import { useAuth } from "../contexts/AuthContext";

const AuthDebug = () => {
  const { user, token, loading, isAuthenticated } = useAuth();

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "#1a2e1a",
        color: "#e0e0e0",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #28392e",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <h4 style={{ margin: "0 0 8px 0", color: "#4cbe00" }}>Auth Debug</h4>
      <div>
        <strong>Loading:</strong> {loading ? "true" : "false"}
      </div>
      <div>
        <strong>IsAuthenticated:</strong> {isAuthenticated ? "true" : "false"}
      </div>
      <div>
        <strong>Has Token:</strong> {token ? "true" : "false"}
      </div>
      <div>
        <strong>Has User:</strong> {user ? "true" : "false"}
      </div>
      {user && (
        <div>
          <strong>User:</strong>
          <pre style={{ fontSize: "10px", margin: "4px 0" }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
      <div>
        <strong>LocalStorage Token:</strong>{" "}
        {localStorage.getItem("token") ? "exists" : "none"}
      </div>
      <div>
        <strong>LocalStorage User:</strong>{" "}
        {localStorage.getItem("user") ? "exists" : "none"}
      </div>
    </div>
  );
};

export default AuthDebug;
