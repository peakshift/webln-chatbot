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

  const { requestPaymentToken, revokePaymentToken } = usePayment();

  const submitMessage = useCallback<ChatContext["submitMessage"]>(
    async (message: string, options) => {
      const onStatusUpdate = options?.onStatusUpdate || (() => {});

      const getPaymentToken = async () => {
        onStatusUpdate("fetching-invoice");

        const { token } = await requestPaymentToken();

        onStatusUpdate("invoice-paid");

        return token;
      };

      const tryFetchResponse = async (token: string) =>
        API.getChatbotResponse({
          messages,
          prompt: message,
          preimage: token,
        }).then(({ response }) => response);

      onStatusUpdate("fetching-response");

      let chatbotResponse: string;
      try {
        const token = await getPaymentToken();
        chatbotResponse = await tryFetchResponse(token);
      } catch (error) {
        if ((error as any).response.status === 402) {
          revokePaymentToken();

          const token = await getPaymentToken();
          chatbotResponse = await tryFetchResponse(token);
        } else {
          throw error;
        }
      }

      onStatusUpdate("response-fetched");

      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), content: message, role: "user" },
        {
          id: Math.random().toString(),
          content: chatbotResponse,
          role: "assistant",
        },
      ]);
    },
    [messages, requestPaymentToken, revokePaymentToken]
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
