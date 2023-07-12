import React from "react";
import ReactModal from "react-modal";
import { usePayment, usePaymentModal } from "../lib/contexts/payment.context";
import { tokensToUSD } from "../utils/helperFunctions";

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
        {packages.map((pkg) => (
          <div key={pkg.id}>
            <h2 className="text-h3">{pkg.name}</h2>
            <p className="text-gray-200 mt-12">
              {pkg.value.toLocaleString()} {pkg.unit}
            </p>
            <p className="text-body2 mt-12">
              {pkg.price.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </p>
            <button
              className="text-violet-400 hover:text-violet-500 font-medium border border-gray-600 p-12 rounded-12 mt-32 flex items-center gap-8"
              onClick={choosePackage(pkg.id)}
            >
              Choose Package
            </button>
          </div>
        ))}
      </div>
      <p className="mt-32">
        <sup>*</sup> A single token is usually around 4 characters.
      </p>
    </ReactModal>
  );
}

const SAFETY_MARGIN = 5000;
const packages = [
  {
    id: 1,
    name: "Small Package",
    unit: "tokens",
    value: 1000,
    price: tokensToUSD(1000 + SAFETY_MARGIN),
  },
  {
    id: 2,
    name: "Medium Package",
    unit: "tokens",
    value: 5000,
    price: tokensToUSD(5000 + SAFETY_MARGIN),
  },
  {
    id: 3,
    name: "Large Package",
    unit: "tokens",
    value: 10_000,
    price: tokensToUSD(10_000 + SAFETY_MARGIN),
  },
];
