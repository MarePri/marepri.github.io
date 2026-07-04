import React from "react";
import ReactDOM from "react-dom/client";
import FashionGPT from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FashionGPT />
    </ErrorBoundary>
  </React.StrictMode>
);
