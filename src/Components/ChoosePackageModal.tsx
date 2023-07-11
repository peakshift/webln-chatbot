import React from "react";
import ReactModal from "react-modal";
import { usePayment, usePaymentModal } from "../lib/contexts/payment.context";

export default function ChoosePackageModal() {
  const { isChoosePackageModalOpen, closeChoosePackageModal } =
    usePaymentModal();

  const { requestPayment } = usePayment();

  const choosePackage = (packageId: number) => async () => {
    const { preimage } = await requestPayment({ packageId });
  };

  return (
    <ReactModal
      isOpen={isChoosePackageModalOpen}
      contentLabel="Pay Invoice Modal"
      onRequestClose={closeChoosePackageModal}
      className={
        "w-[min(900px,90vw)] max-h-[80vh] overflow-y-auto bg-gray-900 text-white rounded-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
      }
    >
      <h1>Choose a package</h1>
      <div className="grid grid-cols-3">
        <div>
          <h2>Package 1</h2>
          <button onClick={choosePackage(1)}>Choose this one</button>
        </div>
        <div>
          <h2>Package 2</h2>
          <button onClick={choosePackage(2)}>Choose this one</button>
        </div>
        <div>
          <h2>Package 3</h2>
          <button onClick={choosePackage(3)}>Choose this one</button>
        </div>
      </div>
    </ReactModal>
  );
}
