import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { useLocalStorage } from "usehooks-ts";
import WebLN from "../services/webln";
import API from "../../api";

interface PaymentContext {
  requestPayment: (amount: number) => Promise<{ preimage: string }>;
  invoice: string;

  isPaymentModalOpen: boolean;
  closePaymentModal: () => void;
  prefersPayImmediately: boolean;
  setPrefersPayImmediately: (prefersPayImmediately: boolean) => void;
}

const context = createContext<PaymentContext>(null!);

export const PaymentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [invoice, setInvoice] = useState("");
  const [verifyUrl, setVerifyUrl] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [prefersPayImmediately, setPrefersPayImmediately] = useLocalStorage(
    "prefers-pay-immediately",
    false
  );

  const onPaymentSuccess = useRef<(preimage: string) => void>(() => {});
  const onPaymentFailure = useRef<() => void>(() => {});

  const requestPayment = useCallback(
    async (amount: number) => {
      // fetch invoice from backend
      const { invoice, verifyUrl } = await API.getInvoice({ amount });
      setInvoice(invoice);
      setVerifyUrl(verifyUrl);

      const promise = new Promise<{ preimage: string }>((res, rej) => {
        onPaymentSuccess.current = (preimage: string) => {
          setInvoice("");
          setVerifyUrl("");
          res({ preimage });
        };
        onPaymentFailure.current = () => {
          setInvoice("");
          setVerifyUrl("");
          rej();
        };
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
    if (verifyUrl) {
      const interval = setInterval(async () => {
        const { settled: isPaid, preimage } = await API.isInvoicePaid({
          verifyUrl,
        });
        if (isPaid) {
          clearInterval(interval);
          setPaymentModalOpen(false);
          onPaymentSuccess.current(preimage);
        }
      }, 2000);

      return () => {
        clearInterval(interval);
      };
    } else {
      setPaymentModalOpen(false);
    }
  }, [verifyUrl]);

  return (
    <context.Provider
      value={{
        requestPayment,
        isPaymentModalOpen: paymentModalOpen,
        invoice,
        closePaymentModal: cancelPayment,
        prefersPayImmediately,
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
    prefersPayImmediately,
    setPrefersPayImmediately,
  } = ctx;
  return {
    isPaymentModalOpen,
    invoice,
    closePaymentModal,
    prefersPayImmediately,
    setPrefersPayImmediately,
  };
};
