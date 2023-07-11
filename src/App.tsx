import "./App.css";
import { Outlet } from "react-router-dom";
import Modal from "react-modal";
import PayInvoiceModal from "./Components/PayInvoiceModal";
import ChoosePackageModal from "./Components/ChoosePackageModal";

Modal.setAppElement("#root");

function App() {
  return (
    <div id="app" className="pt-80">
      <Outlet />
      <ChoosePackageModal />
      <PayInvoiceModal />
    </div>
  );
}

export default App;
