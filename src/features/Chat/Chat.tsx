import { useEffect } from "react";

import MessagesContainer from "./MessagesContainer";
import { useLocalStorage } from "usehooks-ts";
import { usePaymentModal } from "../../lib/contexts/payment.context";

export default function DirectMessaging() {
  const { prefersPayImmediately, setPrefersPayImmediately } = usePaymentModal();

  const [showAutoPayToggle, setShowAutoPayToggle] = useLocalStorage(
    "showAutoPayToggle",
    false
  );

  useEffect(() => {
    if (prefersPayImmediately) {
      setShowAutoPayToggle(true);
    }
  }, [prefersPayImmediately, setShowAutoPayToggle]);

  return (
    <div className="max-w-[130ch] mx-auto px-16">
      <div className="flex flex-wrap gap-16 justify-between items-center mb-16">
        <h1 className="text-h1 font-bolder text-violet-500">
          Chat with AI & pay with Lightning
        </h1>
        {showAutoPayToggle && (
          <label className="relative inline-flex items-center cursor-pointer ml-auto">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={prefersPayImmediately}
              onChange={(e) => setPrefersPayImmediately(e.target.checked)}
            />
            <div className="w-[44px] h-24 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-12 peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-20 after:w-20 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
            <span className="ml-12 text-sm font-medium text-gray-600">
              Auto pay
            </span>
          </label>
        )}
      </div>
      <div className="h-[min(70vh,800px)] bg-gray-400 bg-opacity-30 rounded p-16 flex flex-col ">
        <MessagesContainer />
      </div>
    </div>
  );
}
