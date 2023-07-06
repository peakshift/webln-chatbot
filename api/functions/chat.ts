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
  // Check if the user can make this request (has the header token, it still has enough remaining requests/tokens/time/...etc)

  // if NOT, return 402 with an invoice for some default package (like a 1000 tokens package)

  // if YES, continue as normal

  const { messages, prompt } = req.body as {
    messages: ChatCompletionRequestMessage[];
    prompt: string;
  };

  /*** 
  
 ### Old code from the pay-per-prompt version, just for reference (feel free to delete it after you write your implementation)
  
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
 
 */

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
     
      In the pay-per-prompt version, I'm just removing the invoice after the user pays it. In packages case however, we will instead decrease some amount
     
      await DB.removeInvoice(foundInvoice.hash!); 
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
