import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "mizu-ui/styles.css";
import "mizu-ui/fonts.css";
import { App } from "./App";
import { ToastProvider } from "mizu-ui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
