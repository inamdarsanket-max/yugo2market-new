import React from "react";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div style={{ color: "white", padding: "20px" }}>
      <h1>Welcome {user.name || "User"}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}

export default Dashboard;
