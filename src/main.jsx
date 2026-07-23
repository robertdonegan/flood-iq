import React from "react";
import { createRoot } from "react-dom/client";
import FloodIqHeathrow from "../flood-iq-heathrow.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FloodIqHeathrow />
  </React.StrictMode>
);
