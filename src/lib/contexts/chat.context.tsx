import { createContext, useState, useContext, useCallback } from "react";
import { usePayment } from "./payment.context";
import API from "../../api";

export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

interface ChatContext {
  messages: Message[];
  submitMessage: (
    message: string,
    options?: Partial<{
      onStatusUpdate: (
        status:
          | "fetching-invoice"
          | "invoice-paid"
          | "fetching-response"
          | "response-fetched"
      ) => void;
    }>
  ) => Promise<void>;
}

const context = createContext<ChatContext>(null!);

export const ChatContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const { requestPayment } = usePayment();

  const submitMessage = useCallback<ChatContext["submitMessage"]>(
    async (message: string, options) => {
      const onStatusUpdate = options?.onStatusUpdate || (() => {});

      onStatusUpdate("fetching-invoice");

      const { preimage } = await requestPayment(10);

      onStatusUpdate("invoice-paid");

      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), content: message, role: "user" },
      ]);

      onStatusUpdate("fetching-response");

      const { response: chatbotResponse } = await API.getChatbotResponse({
        messages,
        prompt: message,
        preimage,
      });

      onStatusUpdate("response-fetched");

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          content: chatbotResponse,
          role: "assistant",
        },
      ]);
    },
    [messages, requestPayment]
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
