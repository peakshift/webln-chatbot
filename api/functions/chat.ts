import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
// import { DB } from "../lib/db";
import { SHA256, enc } from "crypto-js";
import { DB } from "../lib/db";
import { createResponse } from "../lib/helpers";
import { CORS_HEADERS } from "../lib/constants";

const chat: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  if (event.httpMethod !== "POST") {
    return createResponse({
      statusCode: 405,
      body: "Method Not Allowed",
    });
  }

  const { messages, prompt } = JSON.parse(event.body || "{}");
  const preimage = event.headers["preimage"];

  if (!preimage) {
    return createResponse({
      statusCode: 400,
      body: "Missing preimage from header",
    });
  }

  const hash = SHA256(enc.Hex.parse(preimage));
  const paymentHash = hash.toString();

  const foundInvoice = await DB.getInvoice(paymentHash);

  if (!foundInvoice) {
    return createResponse({
      statusCode: 400,
      body: "Invalid preimage",
    });
  }

  await DB.removeInvoice(foundInvoice.hash!);

  return createResponse({
    statusCode: 200,
    body: {
      success: true,
      response: 'Response from chatbot to your message "' + prompt + '"',
    },
  });
};

export const handler = chat;
