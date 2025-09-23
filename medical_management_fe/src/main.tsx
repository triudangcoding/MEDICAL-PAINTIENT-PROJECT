import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import { ThemeProvider } from "./components/theme-provider";
import { QueryProvider } from "./providers/QueryProvider";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="aurora-ui-theme">
      <QueryProvider>
        <Toaster />
        <RouterProvider router={router} />
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>
);
