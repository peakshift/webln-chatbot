import { DB } from "../lib/db";
import { isValidPaymentToken } from "../lib/helpers";
import { createExpressApp } from "../lib/express-router";
import ServerlessHttp from "serverless-http";
import express, { Request, Response } from "express";

const getTokenValue = async (req: Request, res: Response) => {
  const authHeader = req.get("Authorization");

  if (!authHeader)
    return res.status(404).json({
      error: "No token provided",
    });

  const [token, preimage] = authHeader.replace("LSAT ", "").split(":");
  const isPaymentValid = await isValidPaymentToken(token, preimage);

  if (!isPaymentValid)
    return res.status(400).json({
      error: "Invalid token",
    });

  const remainingValue = await DB.getTokenRemainingValue(token);

  return res.status(200).json({
    remaining: {
      unit: "tokens",
      value: remainingValue,
    },
  });
};

let app;

if (process.env.LOCAL) {
  app = createExpressApp();
  app.get("/token-value", getTokenValue);
} else {
  const router = express.Router();
  router.get("/token-value", getTokenValue);
  app = createExpressApp(router);
}

export const handler = async (event, context) => {
  const serverlessHandler = ServerlessHttp(app);
  return await serverlessHandler(event, context);
};
