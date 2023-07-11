import { HandlerResponse } from "@netlify/functions";
import { CORS_HEADERS } from "../lib/constants";
import AlbyTools from "alby-tools";
import jose from "jose";
import ENV from "./env";

export const createResponse = (
  args: Partial<HandlerResponse & { body: any }>
) => {
  return {
    statusCode: args.statusCode ?? 200,
    ...args,
    ...(args.body && {
      body:
        typeof args.body === "object" ? JSON.stringify(args.body) : args.body,
    }),
    headers: {
      ...CORS_HEADERS,
      ...(args.headers && args.headers),
    },
  };
};

export async function convertUSDToSats(usd: number) {
  const amountInBTC = await fetch(
    `https://blockchain.info/tobtc?currency=USD&value=${usd}`
  )
    .then((res) => res.text())
    .then((res) => Number(res));

  return amountInBTC * 100_000_000;
}

export async function generateInvoice({
  amount = 100,
  ln_address = "mtg@getably.com",
}: {
  amount?: number;
  ln_address?: string;
}) {
  const ln = new AlbyTools.LightningAddress(ln_address);
  await ln.fetch();

  const invoice = await ln.requestInvoice({
    satoshi: amount,
    comment: "Payment for chat prompt",
  });

  if (!invoice.verify)
    throw new Error("No verify url supported by this ln address provider");

  return invoice;
}

export async function isValidPaymentToken(token, preimage, path) {
  let jwt;
  try {
    jwt = await jose.jwtVerify(token, Buffer.from(ENV.JWT_SECRET), {});
  } catch (e) {
    console.error(e);
    return false;
  }
  if (path !== jwt.payload.path) {
    return false;
  }
  if (Math.floor(Date.now() / 1000) > jwt.payload.exp) {
    return false; // expired
  }
  const invoice = new AlbyTools.Invoice({
    pr: jwt.payload.pr,
    preimage: preimage,
  });
  const isPaid = await invoice.isPaid();

  // TODO
  // Check also in the DB to make sure this invoice hasn't already been used before
  // AND that this token still has some requests left

  return isPaid;
}
