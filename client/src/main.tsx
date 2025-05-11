import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root") as HTMLElement;
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<App />);
