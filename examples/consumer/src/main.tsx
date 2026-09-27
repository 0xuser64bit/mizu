import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "mizu-ui/styles.css";
import "mizu-ui/fonts.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
