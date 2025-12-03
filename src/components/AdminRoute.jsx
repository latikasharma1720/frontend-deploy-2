import React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/session";

export default function AdminRoute({ children }) {
  const user = getUser();
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
