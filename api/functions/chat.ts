import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { SHA256, enc } from "crypto-js";
import { DB } from "../lib/db";
import { createResponse } from "../lib/helpers";
import { CORS_HEADERS } from "../lib/constants";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import ENV from "../lib/env";

const configuration = new Configuration({
  apiKey: ENV.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

  const { messages, prompt } = JSON.parse(event.body || "{}") as {
    messages: ChatCompletionRequestMessage[];
    prompt: string;
  };
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

  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a funny chatbot how always replies in rhythms. But try to keep your replies around 1-3 paragraphs.",
        },
        ...messages
          .filter((msg) => msg.role === "user" || msg.role === "assistant")
          .map((msg) => ({ role: msg.role, content: msg.content })),
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    await DB.removeInvoice(foundInvoice.hash!);

    return createResponse({
      statusCode: 200,
      body: {
        response: chatCompletion.data.choices[0].message?.content,
      },
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    return createResponse({
      statusCode: 500,
      body: {
        error: error.message,
      },
    });
  }
};

export const handler = chat;
