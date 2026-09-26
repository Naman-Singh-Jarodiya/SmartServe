import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const favicon = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9d7cff"/>
        <stop offset="1" stop-color="#2de4ff"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="18" fill="#09101d"/>
    <rect x="7" y="7" width="50" height="50" rx="15" fill="url(#g)"/>
    <path d="M20 18h24v8H29v5h12v8H29v7h-9z" fill="white"/>
  </svg>
`)}`;

const icon = document.querySelector('link[rel="icon"]') || document.createElement("link");
icon.rel = "icon";
icon.href = favicon;
document.head.appendChild(icon);
document.title = "SmartServe — Smart Home Services";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
