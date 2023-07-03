import { requestInvoice, utils } from "lnurl-pay";
import { Message } from "../lib/contexts/chat.context";
import { Invoice, LightningAddress } from "alby-tools";

const mockPaymentsMap = new Map<string, boolean>();

const pendingPaymentsMap = new Map<
  string,
  {
    paid: boolean;
    verifyUrl: string;
  }
>();

const ln = new LightningAddress("mtg@getalby.com");
const lnDataPromise = ln.fetch();

async function getInvoice({ amount }: { amount: number }) {
  await lnDataPromise;

  const invoice = await ln.requestInvoice({
    satoshi: amount,
    comment: "Payment for chat prompt",
  });

  if (!invoice.verify) throw new Error("No verify url supported");

  pendingPaymentsMap.set(invoice.paymentRequest, {
    paid: false,
    verifyUrl: invoice.verify,
  });

  // mockPaymentsMap.set(invoice.paymentHash, false);
  // setTimeout(() => {
  //   mockPaymentsMap.set(invoice.paymentHash, true);
  // }, 10000);

  return invoice.paymentRequest;
}

async function isInvoicePaid({ invoice: pr }: { invoice: string }) {
  const verifyUrl = pendingPaymentsMap.get(pr)?.verifyUrl;

  if (!verifyUrl) throw new Error("No verify url found");

  const { settled } = await fetch(verifyUrl).then((res) => res.json());

  return !!settled;
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
