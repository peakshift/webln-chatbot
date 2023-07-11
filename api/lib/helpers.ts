import { HandlerResponse } from "@netlify/functions";
import { CORS_HEADERS } from "../lib/constants";
import * as AlbyTools from "alby-tools";
import * as jose from "jose";
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
  ln_address = "mtg@getalby.com",
  comment = "",
}: {
  amount?: number;
  ln_address?: string;
  comment?: string;
}) {
  const ln = new AlbyTools.LightningAddress(ln_address);
  await ln.fetch();

  const invoice = await ln.requestInvoice({
    satoshi: amount,
    comment,
  });

  if (!invoice.verify)
    throw new Error("No verify url supported by this ln address provider");

  return invoice;
}

export async function isValidPaymentToken(token, preimage) {
  let jwt;
  try {
    jwt = await jose.jwtVerify(token, Buffer.from(ENV.JWT_SECRET), {});
  } catch (e) {
    console.error(e);
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

export async function generateToken(invoice) {
  const jwt = await new jose.SignJWT({ pr: invoice.paymentRequest })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("720h")
    .sign(Buffer.from(ENV.JWT_SECRET));

  return jwt;
}
