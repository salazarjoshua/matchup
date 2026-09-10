import App from "./App.tsx";
import { loadInterFont } from "@/utils/matchup-font";
import React from "react";
import ReactDOM from "react-dom/client";
import "@/assets/tailwind.css";

loadInterFont();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
