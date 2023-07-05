import { LightningAddress } from "alby-tools";
import { DB } from "../lib/db";
import { convertUSDToSats } from "../lib/helpers";
import { createExpressApp } from "../lib/express-router";
import ServerlessHttp from "serverless-http";
import express, { Request, Response } from "express";

const getInvoice = async (req: Request, res: Response) => {
  const ln = new LightningAddress("mtg@getalby.com");
  await ln.fetch();

  const tokensPriceInUSD = 0.01; // 0.002 per 1k * 4 = 4k max message length + 0.002 charges = 0.01

  const amount = await convertUSDToSats(tokensPriceInUSD);

  const invoice = await ln.requestInvoice({
    satoshi: amount,
    comment: "Payment for chat prompt",
  });

  if (!invoice.verify) throw new Error("No verify url supported");

  await DB.addInvoice(invoice.paymentHash);

  return res.status(200).json({
    pr: invoice.paymentRequest,
    paymentHash: invoice.paymentHash,
    verifyUrl: invoice.verify,
    amountInSats: amount,
  });
};

let app;

if (process.env.LOCAL) {
  app = createExpressApp();
  app.get("/get-invoice", getInvoice);
} else {
  const router = express.Router();
  router.get("/get-invoice", getInvoice);
  app = createExpressApp(router);
}

export const handler = async (event, context) => {
  const serverlessHandler = ServerlessHttp(app);
  return await serverlessHandler(event, context);
};
