import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { requestInvoice, utils } from "lnurl-pay";

interface PaymentContext {
  requestPayment: (amount: number) => Promise<void>;
  invoice: string;

  isPaymentModalOpen: boolean;
  closePaymentModal: () => void;
}

const context = createContext<PaymentContext>(null!);

const fetchInvoice = async (amount: number) => {
  const {
    invoice,
    params,
    successAction,
    hasValidAmount,
    hasValidDescriptionHash,
    validatePreimage,
  } = await requestInvoice({
    lnUrlOrAddress: "mtg@getalby.com",
    tokens: utils.toSats(amount), // in TS you can use utils.checkedToSats or utils.toSats
  });

  tempPaymentMap.set(invoice, false);
  //   setTimeout(() => {
  //     tempPaymentMap.set(invoice, true);
  //   }, 10000);

  return invoice;
};

const tempPaymentMap = new Map<string, boolean>();

const isInvoicePaid = async (invoice: string) => {
  return !!tempPaymentMap.get(invoice);
};

export const PaymentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [invoice, setInvoice] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const onPaymentSuccess = useRef<() => void>(() => {});
  const onPaymentFailure = useRef<() => void>(() => {});

  const requestPayment = useCallback(async (amount: number) => {
    // fetch invoice from backend
    const invoice = await fetchInvoice(amount);
    setInvoice(invoice);
    // open modal
    setPaymentModalOpen(true);

    // wait for payment to be completed
    // close modal
    // return payment result to caller
    return new Promise<void>((res, rej) => {
      onPaymentSuccess.current = res;
      onPaymentFailure.current = rej;
    });
  }, []);

  const cancelPayment = useCallback(() => {
    setPaymentModalOpen(false);
    onPaymentFailure.current();
  }, []);

  useEffect(() => {
    if (invoice) {
      setPaymentModalOpen(true);

      const interval = setInterval(async () => {
        const isPaid = await isInvoicePaid(invoice);
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
  const { isPaymentModalOpen, invoice, closePaymentModal } = ctx;
  return { isPaymentModalOpen, invoice, closePaymentModal };
};
