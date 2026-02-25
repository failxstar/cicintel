

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/tamil-font.css";
import { initializeMobileFirst } from "./utils/mobileDetection";
import { LanguageProvider } from "./contexts/LanguageContext";

// Initialize mobile-first setup
initializeMobileFirst();

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
