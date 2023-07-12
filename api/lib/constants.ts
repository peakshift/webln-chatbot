import { tokensToSats } from "./helpers";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept, Preimage",
  "Access-Control-Allow-Credentials": true,
};

const SAFETY_MARGIN = 5000; // in case the user make the last request very big and it goes over the limit

export const packages = [
  {
    id: 1,
    name: "Small Package",
    unit: "tokens",
    value: 1000,
    getPackagePrice: () => tokensToSats(1000 + SAFETY_MARGIN),
  },
  {
    id: 2,
    name: "Medium Package",
    unit: "tokens",
    value: 5000,
    getPackagePrice: () => tokensToSats(5000 + SAFETY_MARGIN),
  },
  {
    id: 3,
    name: "Large Package",
    unit: "tokens",
    value: 10000,
    getPackagePrice: () => tokensToSats(10000 + SAFETY_MARGIN),
  },
];
