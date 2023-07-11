import mongoose from "mongoose";
import ENV from "./env";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (!ENV.MONGO_URI) throw new Error("Missing MONGO_URI env var");

  await mongoose.connect(ENV.MONGO_URI);
};

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const Invoice = new Schema({
  id: ObjectId,
  hash: String,
});

const Token = new Schema({
  id: ObjectId,
  token: String,
  unit: String,
  value: Number,
});

const invoiceModel = mongoose.model("Invoice", Invoice);
const tokenModel = mongoose.model("Token", Token);

export const DB = {
  getInvoice: async (hash: string) => {
    await connectDB();

    return invoiceModel.findOne({ hash });
  },
  addInvoice: async (hash: string) => {
    await connectDB();

    return invoiceModel.create({ hash });
  },
  removeInvoice: async (hash: string) => {
    await connectDB();

    return invoiceModel.deleteOne({ hash });
  },

  getToken: async (token: string) => {
    await connectDB();

    return tokenModel.findOne({ token });
  },

  addToken: async (token: string, unit = "tokens", value: number) => {
    await connectDB();

    return tokenModel.create({ token, unit, value });
  },

  removeToken: async (token: string) => {
    await connectDB();
    return tokenModel.deleteOne({ token });
  },

  decreaseTokenValue: async (token: string, used: number) => {
    await connectDB();

    const tokenObj = await DB.getToken(token);

    if (!tokenObj) throw new Error("Token not found");

    const newValue = tokenObj.value! - used;

    if (newValue <= 0) await DB.removeToken(token);

    await tokenModel.updateOne({ token }, { value: newValue });

    return newValue;
  },

  tokenHasValue: async (_token: string) => {
    const token = await DB.getToken(_token);

    if (!token) return false;
    if (token.unit === "tokens" && token.value && token.value < 0) return false;
    return true;
  },
};
