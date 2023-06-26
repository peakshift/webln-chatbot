import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { utils } from "lnurl-pay";
import { useLocalStorage } from "usehooks-ts";
import WebLN from "../services/webln";
import API from "../../api";

interface PaymentContext {
  requestPayment: (amount: number) => Promise<{ invoice: string }>;
  invoice: string;

  isPaymentModalOpen: boolean;
  closePaymentModal: () => void;
  setPrefersPayImmediately: (prefersPayImmediately: boolean) => void;
}

const context = createContext<PaymentContext>(null!);

export const PaymentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [invoice, setInvoice] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [prefersPayImmediately, setPrefersPayImmediately] = useLocalStorage(
    "prefers-pay-immediately",
    false
  );

  const onPaymentSuccess = useRef<() => void>(() => {});
  const onPaymentFailure = useRef<() => void>(() => {});

  const requestPayment = useCallback(
    async (amount: number) => {
      // fetch invoice from backend
      const invoice = await API.getInvoice({ amount });
      setInvoice(invoice);

      const promise = new Promise<{ invoice: string }>((res, rej) => {
        onPaymentSuccess.current = () => res({ invoice });
        onPaymentFailure.current = rej;
      });

      if (prefersPayImmediately) {
        // try first to pay with webln without showing the modal
        await WebLN.sendPayment(invoice).catch(() => {
          // if it fails for whatever reason, open modal
          alert("Couldn't pay with WebLN");
          setPaymentModalOpen(true);
          setPrefersPayImmediately(false);
        });
      } else {
        // open modal
        console.log("open modal");
        setPaymentModalOpen(true);
      }

      // wait for payment to be completed
      // close modal
      // return payment result to caller
      return promise;
    },
    [prefersPayImmediately, setPrefersPayImmediately]
  );

  const cancelPayment = useCallback(() => {
    setPaymentModalOpen(false);
    onPaymentFailure.current();
  }, []);

  useEffect(() => {
    if (invoice) {
      const interval = setInterval(async () => {
        const isPaid = await API.isInvoicePaid({ invoice });
        if (isPaid) {
          clearInterval(interval);
          setPaymentModalOpen(false);
          onPaymentSuccess.current();
        }
      }, 2000);

      return () => {
        clearInterval(interval);
      };
    } else {
      setPaymentModalOpen(false);
    }
  }, [invoice]);

  return (
    <context.Provider
      value={{
        requestPayment,
        isPaymentModalOpen: paymentModalOpen,
        invoice,
        closePaymentModal: cancelPayment,
        setPrefersPayImmediately,
      }}
    >
      {children}
    </context.Provider>
  );
};

export const usePayment = () => {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error("useChat must be used within a PaymentContextProvider");
  }
  const { requestPayment } = ctx;
  return { requestPayment };
};

export const usePaymentModal = () => {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error("useChat must be used within a PaymentContextProvider");
  }
  const {
    isPaymentModalOpen,
    invoice,
    closePaymentModal,
    setPrefersPayImmediately,
  } = ctx;
  return {
    isPaymentModalOpen,
    invoice,
    closePaymentModal,
    setPrefersPayImmediately,
  };
};
