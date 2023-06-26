import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ChatContextProvider } from "./lib/contexts/chat.context";
import { PaymentContextProvider } from "./lib/contexts/payment.context";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PaymentContextProvider>
      <ChatContextProvider>
        <RouterProvider router={router} />
      </ChatContextProvider>
    </PaymentContextProvider>
  </React.StrictMode>
);
