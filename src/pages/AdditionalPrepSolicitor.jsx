import React from "react";
import { Navigate } from "react-router-dom";

export default function AdditionalPrepSolicitor() {
  return <Navigate to="/AdditionalPrepWorksheet?role=Solicitor" replace />;
}
