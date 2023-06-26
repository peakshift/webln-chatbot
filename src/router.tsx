import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Chat from "./features/Chat/Chat";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Chat />,
      },
    ],
  },
]);
