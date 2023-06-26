import { requestInvoice, utils } from "lnurl-pay";
import { Message } from "../lib/contexts/chat.context";

const mockPaymentsMap = new Map<string, boolean>();

async function getInvoice({ amount }: { amount: number }) {
  const {
    invoice,
    // params,
    // successAction,
    // hasValidAmount,
    // hasValidDescriptionHash,
    // validatePreimage,
  } = await requestInvoice({
    lnUrlOrAddress: "mtg@getalby.com",
    tokens: utils.toSats(amount), // in TS you can use utils.checkedToSats or utils.toSats
  });

  mockPaymentsMap.set(invoice, false);
  setTimeout(() => {
    mockPaymentsMap.set(invoice, true);
  }, 10000);

  return invoice;
}

async function isInvoicePaid({ invoice }: { invoice: string }) {
  const paid = mockPaymentsMap.get(invoice);
  if (paid === undefined) {
    throw new Error("Invoice not found");
  }
  return paid;
}

async function getChatbotResponse({
  messages,
}: {
  messages: Message[];
  prompt: string;
  invoice: string;
}) {
  await delay();
  return getRandomSentence();
}

export const API = {
  getInvoice,
  isInvoicePaid,
  getChatbotResponse,
};

export default API;

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
