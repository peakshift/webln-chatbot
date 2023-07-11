import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

export const createExpressApp = (router?: any) => {
  const app = express();
  const routerBasePath = process.env.LOCAL ? `/dev` : `/.netlify/functions`;

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse application/json
  app.use(bodyParser.json());

  app.use(cookieParser());
  app.use(
    cors({
      origin: "*",
      credentials: true,
      exposedHeaders: "*"
    })
  );

  if (router) app.use(routerBasePath, router);

  return app;
};
