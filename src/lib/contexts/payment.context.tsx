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
  requestPayment: (
    options: PaymentRequestOptions
  ) => Promise<{ preimage: string; paymentToken: string }>;
  requestPaymentToken: () => Promise<{ token: string }>;
  invoice: string;

  isPaymentModalOpen: boolean;
  isChoosePackageModalOpen: boolean;
  closePaymentModal: () => void;
  closeChoosePackageModal: () => void;
  prefersPayImmediately: boolean;
  setPrefersPayImmediately: (prefersPayImmediately: boolean) => void;
  setPaymentToken: (token: string) => void;
  revokePaymentToken: () => void;
}

export type PaymentRequestOptions = { amount: number } | { packageId: number };

const context = createContext<PaymentContext>(null!);

export const PaymentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [invoice, setInvoice] = useState("");
  const [verifyUrl, setVerifyUrl] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [choosePackageModalOpen, setChoosePackageModalOpen] = useState(false);

  const [prefersPayImmediately, setPrefersPayImmediately] = useLocalStorage(
    "prefers-pay-immediately",
    false
  );

  const [paymentToken, setPaymentToken] = useLocalStorage("payment-token", "");
  const paymentTokenRef = useRef<string>(paymentToken);

  paymentTokenRef.current = paymentToken;

  const onPaymentSuccess = useRef<(preimage: string) => void>(() => {});
  const onPaymentFailure = useRef<() => void>(() => {});

  const onGetPaymentTokenSuccess = useRef<(token: string) => void>(() => {});
  const onGetPaymentTokenFailure = useRef<() => void>(() => {});

  const requestPayment = useCallback(
    async (options: { amount: number } | { packageId: number }) => {
      setInvoice("");
      setVerifyUrl("");

      if (!prefersPayImmediately) setPaymentModalOpen(true);

      // fetch invoice from backend
      const { invoice, verifyUrl, macaroon } = await API.getInvoice(options);

      setInvoice(invoice);
      setVerifyUrl(verifyUrl);

      const promise = new Promise<{ preimage: string; paymentToken: string }>(
        (res, rej) => {
          onPaymentSuccess.current = (preimage: string) => {
            setInvoice("");
            setVerifyUrl("");
            const paymentToken = `LSAT ${macaroon}:${preimage}`;
            res({ preimage, paymentToken });
          };
          onPaymentFailure.current = () => {
            setInvoice("");
            setVerifyUrl("");
            rej();
          };
        }
      );

      if (prefersPayImmediately) {
        // try first to pay with webln without showing the modal
        await WebLN.sendPayment(invoice).catch(() => {
          // if it fails for whatever reason, open modal
          alert("Couldn't pay with WebLN");
          setPaymentModalOpen(true);
          setPrefersPayImmediately(false);
        });
      }

      // wait for payment to be completed
      // close modal
      // return payment result to caller
      return promise;
    },
    [prefersPayImmediately, setPrefersPayImmediately]
  );

  const requestPaymentToken = useCallback(async () => {
    const paymentToken = paymentTokenRef.current;
    // check if I already have a payment token
    // if yes, make sure it's still valid (but how??)
    if (paymentToken) return { token: paymentToken };

    // if not
    // show "Choose a package" modal
    setChoosePackageModalOpen(true);

    const promise = new Promise<{ token: string }>((res, rej) => {
      onGetPaymentTokenSuccess.current = (token: string) => {
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

    // close modal
    // return payment result to caller
    return promise;
  }, []);

  const cancelPayment = useCallback(() => {
    setPaymentModalOpen(false);
    onPaymentFailure.current();
  }, []);

  const closeChoosePackageModal = useCallback(() => {
    setChoosePackageModalOpen(false);
    onGetPaymentTokenFailure.current();
  }, []);

  const revokePaymentToken = useCallback(() => {
    paymentTokenRef.current = "";
    setPaymentToken("");
  }, [setPaymentToken]);

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

  useEffect(() => {
    if (paymentToken) {
      onGetPaymentTokenSuccess.current(paymentToken);
      onGetPaymentTokenSuccess.current = () => {};
      onGetPaymentTokenFailure.current = () => {};
      setChoosePackageModalOpen(false);
    }
  }, [paymentToken]);

  return (
    <context.Provider
      value={{
        requestPayment,
        isPaymentModalOpen: paymentModalOpen,
        isChoosePackageModalOpen: choosePackageModalOpen,
        invoice,
        closePaymentModal: cancelPayment,
        closeChoosePackageModal,
        prefersPayImmediately,
        setPrefersPayImmediately,
        requestPaymentToken,
        setPaymentToken,
        revokePaymentToken,
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
  const {
    requestPayment,
    requestPaymentToken,
    revokePaymentToken,
    setPaymentToken,
  } = ctx;
  return {
    requestPayment,
    requestPaymentToken,
    revokePaymentToken,
    setPaymentToken,
  };
};

export const usePaymentModal = () => {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error("useChat must be used within a PaymentContextProvider");
  }
  const {
    isPaymentModalOpen,
    isChoosePackageModalOpen,
    invoice,
    closePaymentModal,
    closeChoosePackageModal,
    prefersPayImmediately,
    setPrefersPayImmediately,
  } = ctx;
  return {
    isPaymentModalOpen,
    isChoosePackageModalOpen,
    invoice,
    closePaymentModal,
    closeChoosePackageModal,
    prefersPayImmediately,
    setPrefersPayImmediately,
  };
};
