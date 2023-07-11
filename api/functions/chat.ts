import {
  generateInvoice,
  generateToken,
  isValidPaymentToken,
} from "../lib/helpers";
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
  // Check if the user can make this request (has the header token, it still has enough remaining requests/tokens/time/...etc)
  const authHeader = req.get("Authorization");

  let isPaymentValid = false;

  if (authHeader) {
    console.info(`Auth header present`);
    const [token, preimage] = authHeader.replace("LSAT ", "").split(":");
    isPaymentValid = await isValidPaymentToken(
      token,
      preimage,
      req.originalUrl
    );
  }

  if (!isPaymentValid) {
    // if NOT, return 402 with an invoice for some default package (like a 1000 tokens package)

    // extract 'packageId' from query params
    const packageId = req.query.packageId ?? "1";

    const amount = 100; // or get the amount from the DB based on the packageId

    const invoice = await generateInvoice({
      amount,
      comment: "Payment for chatbot package",
    });

    const jwt = await generateToken(invoice, req.originalUrl);
    // Store it in the DB for verification later
    // TODO

    res.set({
      "www-authenticate": `LSAT macaroon=${jwt},invoice=${invoice.paymentRequest}`,
    });
    return res.status(402).json({
      invoice: invoice.paymentRequest,
      paymentHash: invoice.paymentHash,
      verifyUrl: invoice.verify,
      amountInSats: amount,
      macaroon: jwt,
    });
  }

  // if valid, continue as normal

  const { messages, prompt } = req.body as {
    messages: ChatCompletionRequestMessage[];
    prompt: string;
  };

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

    /**
      It would be great if you can return to the client some kind of value indicating how much this token still has remaining.
      For example: {
        response: 'whatever-here',
        remaining:{
          tokens: 832,
          // Or
          requests: 12,
        }
      }

      So that I can show something in the UI like "You have 832 tokens remaining" or "You have 12 requests remaining".
      
      */

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
