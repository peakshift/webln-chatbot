import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { LightningAddress } from "alby-tools";
import { requestInvoice, utils } from "lnurl-pay";
import { DB } from "../lib/db";
// import { DB } from "../lib/db";

const getInvoice: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const ln = new LightningAddress("mtg@getalby.com");
  await ln.fetch();

  const invoice = await ln.requestInvoice({
    satoshi: 100,
    comment: "Payment for chat prompt",
  });

  if (!invoice.verify) throw new Error("No verify url supported");

  await DB.addInvoice(invoice.paymentHash);

  return {
    statusCode: 200,
    body: JSON.stringify({
      pr: invoice.paymentRequest,
      paymentHash: invoice.paymentHash,
      verifyUrl: invoice.verify,
    }),
  };
};

export const handler = getInvoice;
