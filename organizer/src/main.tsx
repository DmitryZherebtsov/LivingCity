import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { OrganizerAuthProvider } from "@/context/OrganizerAuthContext";

createRoot(document.getElementById("root")!).render(
  <OrganizerAuthProvider>
    <App />
  </OrganizerAuthProvider>
);
