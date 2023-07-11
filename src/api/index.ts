import { Message } from "../lib/contexts/chat.context";
import { ENV } from "../utils/env";

async function getInvoice(
  options?: { amount: number } | { packageId: number }
) {
  const queryParams = new URLSearchParams(options as any).toString();

  const { invoice, paymentHash, verifyUrl, macaroon } = await fetcher(
    "/chat?" + queryParams,
    "POST"
  ).catch((err) => {
    if (err.status === 402) {
      console.log(err.data);
      return err.data;
    } else throw err;
  });

  return { invoice, paymentHash, verifyUrl, macaroon };
}

async function isInvoicePaid({ verifyUrl }: { verifyUrl: string }) {
  const { settled, preimage } = (await fetch(verifyUrl).then((res) =>
    res.json()
  )) as { settled: boolean; preimage: string };

  return { settled, preimage };
}

async function getChatbotResponse({
  token,
  messages,
  prompt,
}: {
  messages: Message[];
  prompt: string;
  token: string;
}) {
  const { response } = await fetcher("/chat", "POST", {
    body: { messages, prompt },
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  return { response };
}

export const API = {
  getInvoice,
  isInvoicePaid,
  getChatbotResponse,
};

export default API;

function fetcher(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  options?: Partial<{ body: any; headers: any }>
) {
  return fetch(ENV.ApiUrl + url, {
    method: method,
    ...(options?.body && { body: JSON.stringify(options.body) }),
    ...(options?.headers && { headers: options.headers }),
  })
    .then(async (response) => {
      const data = await response.json();

      // check for error response
      if (!response.ok) {
        // get error message from body or default to response status
        return Promise.reject({
          data,
          status: response.status,
        });
      }

      return data;
    })
    .catch((error) => {
      throw error;
    });
}
