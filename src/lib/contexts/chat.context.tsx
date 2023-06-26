import { createContext, useState, useContext, useCallback } from "react";
import { usePayment } from "./payment.context";

export type Message = {
  id: string;
  content: string;
};

interface ChatContext {
  messages: Message[];
  submitMessage: (message: string) => Promise<void>;
}

const context = createContext<ChatContext>(null!);

export const ChatContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const { requestPayment } = usePayment();

  const submitMessage = useCallback(
    async (message: string) => {
      await requestPayment(100);
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), content: message },
      ]);
    },
    [requestPayment]
  );

  return (
    <context.Provider value={{ messages, submitMessage }}>
      {children}
    </context.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatContextProvider");
  }
  return ctx;
};
