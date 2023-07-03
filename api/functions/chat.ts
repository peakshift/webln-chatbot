import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { LightningAddress } from "alby-tools";
import { requestInvoice, utils } from "lnurl-pay";
// import { DB } from "../lib/db";
import { SHA256, enc } from "crypto-js";
import { DB } from "../lib/db";

const chat: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed",
    };
  }

  const { messages, prompt } = JSON.parse(event.body || "{}");
  const preimage = event.headers["preimage"];

  if (!preimage) {
    return {
      statusCode: 400,
      body: "Missing preimage from header",
    };
  }

  // const paymentHash = SHA256(preimage,).toString();

  // calc hex sha256 hash
  const hash = SHA256(enc.Hex.parse(preimage));
  const paymentHash = hash.toString();

  console.log("paymentHash", paymentHash);
  const foundInvoice = await DB.getInvoice(paymentHash);

  if (!foundInvoice) {
    return {
      statusCode: 400,
      body: "Invalid preimage",
    };
  }

  await DB.removeInvoice(foundInvoice.hash!);

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      prompt,
    }),
  };
};

export const handler = chat;
