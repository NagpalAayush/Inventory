import mongoose, { Schema } from "mongoose";
import User from "./User.js";

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true },
  category: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  userId : {type: Schema.Types.ObjectId , ref : User}
});
  
export const Inventory = mongoose.model("Inventory", inventorySchema);