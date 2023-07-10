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
  requestPayment: (amount?: number) => Promise<{ preimage: string }>;
  requestPaymentToken: () => Promise<{ token: string }>;
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

  const [paymentToken, setPaymentToken] = useLocalStorage("payment-token", "");

  const onPaymentSuccess = useRef<(preimage: string) => void>(() => {});
  const onPaymentFailure = useRef<() => void>(() => {});

  const requestPayment = useCallback(
    async (amount?: number) => {
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

  const requestPaymentToken = useCallback(async () => {
    // check if I already have a payment token

    // if yes, make sure it's still valid

    // if not
    // show "Choose a package" modal

    // fetch invoice from backend

    // show normal invoice modal

    // upon user paying, return payment token

    const { invoice, verifyUrl } = await API.getInvoice({ amount: 10 });
    setInvoice(invoice);
    setVerifyUrl(verifyUrl);

    const promise = new Promise<{ token: string }>((res, rej) => {
      onPaymentSuccess.current = (token: string) => {
        setInvoice("");
        setVerifyUrl("");
        res({ token });
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
  }, [prefersPayImmediately, setPrefersPayImmediately]);

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
        requestPaymentToken,
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
