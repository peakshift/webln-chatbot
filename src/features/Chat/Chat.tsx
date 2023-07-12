import { FiCopy, FiShoppingCart } from "react-icons/fi";
import { usePayment } from "../../lib/contexts/payment.context";
import useCopyToClipboard from "../../lib/hooks/useCopyToClipboard";
import MessagesContainer from "./MessagesContainer";

export default function DirectMessaging() {
  const copyToClipBoard = useCopyToClipboard();

  const {
    valueRemainingInToken,
    paymentToken,
    setPaymentToken,
    requestPaymentToken,
  } = usePayment();

  const handleCopyToken = () => {
    copyToClipBoard(paymentToken);
    alert("Copied token to clipboard!");
  };

  const handlePasteToken = () => {
    const token = prompt("Paste token here");
    if (token) {
      setPaymentToken(token);
    }
  };

  const handleBuyToken = async () => {
    try {
      await requestPaymentToken();
    } catch (error) {}
  };

  return (
    <div className="max-w-[130ch] mx-auto px-16">
      <div className="bg-violet-200 p-16 rounded mb-32 flex items-center justify-between">
        {valueRemainingInToken > 0 ? (
          <>
            <p>
              You have{" "}
              <span className="font-bolder text-violet-700">
                {valueRemainingInToken}
              </span>{" "}
              tokens left in your current payment token.
            </p>

            <button
              className="flex items-center gap-8 text-violet-500 hover:bg-violet-100 font-medium p-12 rounded-12"
              aria-label="copy invoice"
              onClick={handleCopyToken}
            >
              Copy token
              <FiCopy />
            </button>
          </>
        ) : (
          <>
            <p>
              You can either buy a new token or paste an existing token to start
            </p>
            <div className="flex gap-8">
              <button
                className="flex items-center gap-8 text-violet-500 hover:bg-violet-100 font-medium p-12 rounded-12"
                aria-label="copy invoice"
                onClick={handleBuyToken}
              >
                Buy token
                <FiShoppingCart />
              </button>
              <button
                className="flex items-center gap-8 text-violet-500 hover:bg-violet-100 font-medium p-12 rounded-12"
                aria-label="copy invoice"
                onClick={handlePasteToken}
              >
                Paste token
                <FiCopy />
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-16 justify-between items-center mb-16">
        <h1 className="text-h1 font-bolder text-violet-500">
          Chat with AI & pay with Lightning
        </h1>
      </div>
      <div className="h-[min(70vh,800px)] bg-gray-400 bg-opacity-30 rounded p-16 flex flex-col ">
        <MessagesContainer />
      </div>
    </div>
  );
}
