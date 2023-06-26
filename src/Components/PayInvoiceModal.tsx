import React from "react";
import ReactModal from "react-modal";
import { usePaymentModal } from "../lib/contexts/payment.context";
import QRCode from "react-qr-code";
import { FiCopy } from "react-icons/fi";

export default function PayInvoiceModal() {
  const { isPaymentModalOpen, invoice, closePaymentModal } = usePaymentModal();

  return (
    <ReactModal
      isOpen={isPaymentModalOpen}
      contentLabel="Pay Invoice Modal"
      onRequestClose={closePaymentModal}
      className={
        "w-[min(800px,90vw)] max-h-[80vh] overflow-y-auto bg-gray-900 text-white rounded-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
      }
    >
      <div className="grid grid-cols-[326px_1fr]">
        <div className="p-24 bg-gray-800">
          <h2 className="text-body1 font-bolder">Pay with lightning ⚡</h2>
          <p className="text-gray-300 font-medium mt-24">
            Popular wallets and exchanges
          </p>
          <ul className="mt-24 flex flex-col gap-24">
            {wallets.map((wallet) => (
              <li key={wallet.name} className="flex items-center gap-16">
                <img
                  src={wallet.logo}
                  alt=""
                  className="w-42 h-42 rounded-16 object-cover"
                />
                <a
                  href={wallet.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:text-blue-400"
                >
                  <p className="text-body4 font-medium">{wallet.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-24 bg-gray-900 flex flex-col items-center">
          <h2 className="text-body1 font-bolder">
            Scan to pay for your prompt
          </h2>{" "}
          <a href={`lightning:${invoice}`}>
            <QRCode
              size={256}
              value={invoice}
              viewBox={`0 0 256 256`}
              className="h-auto w-full max-w-[300px] mt-40 bg-white p-12 rounded"
            />
          </a>
          <div className="flex gap-8 items-center mt-24">
            <p className="font-medium">
              {invoice.slice(0, 11)}...{invoice.slice(-10)}
            </p>{" "}
            <button className="w-40 aspect-square flex flex-col justify-center items-center hover:bg-gray-200 rounded-full">
              <FiCopy />
            </button>
          </div>
          <p className="font-medium mt-4 text-center">
            Scan this code or copy + paste it to your lightning wallet. Or if
            you have a webln extension, you can just click on the QR code above.
          </p>
          <a
            href="https://thebitcoinmanual.com/security/lightning-wallet"
            target="_blank"
            rel="noreferrer"
            className="text-violet-400 hover:text-violet-500 border border-gray-600 p-12 rounded-12 mt-32"
          >
            What is a wallet
          </a>
        </div>
      </div>
    </ReactModal>
  );
}

const wallets = [
  {
    name: "Breez",
    link: "https://breez.technology/",
    logo: "https://i.postimg.cc/zfYf28VL/avatars.jpg",
  },
  {
    name: "Bluewallet",
    link: "https://bluewallet.io/",
    logo: "https://i.postimg.cc/d3fs2KbV/avatars-1.jpg",
  },
  {
    name: "Zeus",
    link: "https://zeusln.app/",
    logo: "https://i.postimg.cc/J4y41GXD/avatars-2.jpg",
  },
  {
    name: "Wallet of Satoshi",
    link: "https://www.walletofsatoshi.com/",
    logo: "https://i.postimg.cc/7PtZ8g5r/avatars-3.jpg",
  },
  {
    name: "ZEBEDEE",
    link: "https://zebedee.io/",
    logo: "https://i.postimg.cc/HLmp4zhX/avatars-4.jpg",
  },
  {
    name: "Munn",
    link: "https://muun.com/",
    logo: "https://i.postimg.cc/15LR4s0W/avatars-5.jpg",
  },
];
