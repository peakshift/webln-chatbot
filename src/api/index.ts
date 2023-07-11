import { Message } from "../lib/contexts/chat.context";
import { ENV } from "../utils/env";

async function getInvoice(
  options?: { amount: number } | { packageId: number }
) {
  const queryParams = new URLSearchParams(options as any).toString();

  const { invoice, paymentHash, verifyUrl, macaroon } = await fetcher(
    "/chat?" + queryParams,
    "POST"
  );

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
      if (!response.ok && response.status !== 402) {
        // get error message from body or default to response status
        const error = (data && data.message) || response.status;
        return Promise.reject(error);
      }

      return data;
    })
    .catch((error) => {
      throw error;
    });
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 1500));
}

function getRandomSentence() {
  const sentences = [
    "What's your favorite color?",
    "Have you seen any good movies lately?",
    "Do you have any pets?",
    "What's your favorite food?",
    "Did you watch the game last night?",
    "What's your favorite book?",
    "Do you enjoy cooking?",
    "Have you ever traveled outside the country?",
    "What's your favorite season?",
    "Do you play any musical instruments?",
    "What's your dream job?",
    "Have you been to any concerts recently?",
    "Do you like hiking?",
    "What's your favorite type of music?",
    "Have you ever gone skydiving?",
  ];
  const index = Math.floor(Math.random() * (sentences.length - 1));
  return sentences[index];
}
