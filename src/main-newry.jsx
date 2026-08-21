import React from "react";
import { createRoot } from "react-dom/client";
import FloodIqNewry from "../flood-iq-newry.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FloodIqNewry />
  </React.StrictMode>
);
