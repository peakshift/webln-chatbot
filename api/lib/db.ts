import mongoose from "mongoose";
import ENV from "./env";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (!ENV.MONGO_URI) throw new Error("Missing MONGO_URI env var");

  await mongoose.connect(ENV.MONGO_URI);
  console.log("db connected..!");
};

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const Invoice = new Schema({
  id: ObjectId,
  hash: String,
});

const invoiceModel = mongoose.model("Invoice", Invoice);

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
};
