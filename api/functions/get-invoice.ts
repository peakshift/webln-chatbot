import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { LightningAddress } from "alby-tools";
import { DB } from "../lib/db";
import { convertUSDToSats, createResponse } from "../lib/helpers";

const getInvoice: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
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

  return createResponse({
    body: {
      pr: invoice.paymentRequest,
      paymentHash: invoice.paymentHash,
      verifyUrl: invoice.verify,
      amountInSats: amount,
    },
  });
};

export const handler = getInvoice;
