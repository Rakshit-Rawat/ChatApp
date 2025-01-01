// UserPage.jsx
import React from "react";
import { useAuth } from "./AuthContext";

const User= () => {
  const { user } = useAuth();

  if (!user) {
    return <p>You are not logged in.</p>;
  }

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
};

export default User;
