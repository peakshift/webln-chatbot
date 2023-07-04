import { HandlerResponse } from "@netlify/functions";
import { CORS_HEADERS } from "../lib/constants";

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
