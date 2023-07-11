import React from "react";
import ReactModal from "react-modal";
import { usePayment, usePaymentModal } from "../lib/contexts/payment.context";

export default function ChoosePackageModal() {
  const { isChoosePackageModalOpen, closeChoosePackageModal } =
    usePaymentModal();

  const { requestPayment, setPaymentToken } = usePayment();

  const choosePackage = (packageId: number) => async () => {
    const { paymentToken } = await requestPayment({ packageId });
    setPaymentToken(paymentToken);
  };

  return (
    <ReactModal
      isOpen={isChoosePackageModalOpen}
      contentLabel="Pay Invoice Modal"
      onRequestClose={closeChoosePackageModal}
      className={
        "w-[min(900px,90vw)] max-h-[80vh] overflow-y-auto bg-gray-900 text-white rounded-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-48"
      }
    >
      <h1 className="text-h1 mb-32">Choose a package</h1>
      <div className="grid grid-cols-3 gap-24">
        <div>
          <h2 className="text-h3">Package 1</h2>
          <p className="text-gray-200">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores ea
            fugiat deleniti hic, dignissimos ex blanditiis error. Est harum
            alias saepe laboriosam?
          </p>
          <button
            className="text-violet-400 hover:text-violet-500 font-medium border border-gray-600 p-12 rounded-12 mt-32 flex items-center gap-8"
            onClick={choosePackage(1)}
          >
            Choose Package
          </button>
        </div>
        <div>
          <h2 className="text-h3">Package 2</h2>
          <p className="text-gray-200">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores ea
            fugiat deleniti hic, dignissimos ex blanditiis error. Est harum
            alias saepe laboriosam?
          </p>
          <button
            className="text-violet-400 hover:text-violet-500 font-medium border border-gray-600 p-12 rounded-12 mt-32 flex items-center gap-8"
            onClick={choosePackage(2)}
          >
            Choose Package
          </button>
        </div>
        <div>
          <h2 className="text-h3">Package 3</h2>
          <p className="text-gray-200">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores ea
            fugiat deleniti hic, dignissimos ex blanditiis error. Est harum
            alias saepe laboriosam?
          </p>
          <button
            className="text-violet-400 hover:text-violet-500 font-medium border border-gray-600 p-12 rounded-12 mt-32 flex items-center gap-8"
            onClick={choosePackage(3)}
          >
            Choose Package
          </button>
        </div>
      </div>
    </ReactModal>
  );
}
