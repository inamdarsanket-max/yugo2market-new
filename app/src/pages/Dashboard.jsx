import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ color: "white", padding: "20px" }}>
      <h1>Dashboard</h1>

      <pre style={{ background: "#111", padding: "10px" }}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
