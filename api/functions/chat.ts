import { SHA256, enc } from "crypto-js";
import { DB } from "../lib/db";
import { createResponse } from "../lib/helpers";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import ENV from "../lib/env";
import { createExpressApp } from "../lib/express-router";
import ServerlessHttp from "serverless-http";
import express, { Request, Response, Express } from "express";

const configuration = new Configuration({
  apiKey: ENV.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const chat = async (req: Request, res: Response) => {
  const { messages, prompt } = req.body as {
    messages: ChatCompletionRequestMessage[];
    prompt: string;
  };
  const preimage = req.headers["preimage"];

  if (typeof preimage !== "string") {
    return createResponse({
      statusCode: 400,
      body: "Missing preimage from header",
    });
  }

  const hash = SHA256(enc.Hex.parse(preimage));
  const paymentHash = hash.toString();

  const foundInvoice = await DB.getInvoice(paymentHash);

  if (!foundInvoice) {
    return res.status(400).json({
      error: "Invoice not found",
    });
  }

  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a funny chatbot who always replies in rhythms. But try to keep your replies around 1-3 paragraphs.",
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

    return res.status(200).json({
      response: chatCompletion.data.choices[0].message?.content,
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    return res.status(500).json({
      error: error.message,
    });
  }
};

let app: Express;

if (process.env.LOCAL) {
  app = createExpressApp();
  app.post("/chat", chat);
} else {
  const router = express.Router();
  router.post("/chat", chat);
  app = createExpressApp(router);
}

export const handler = async (event, context) => {
  const serverlessHandler = ServerlessHttp(app);
  return await serverlessHandler(event, context);
};
