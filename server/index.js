import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";
import { Inventory } from "./models/Inventory.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import verifyToken from "./utils/auth.js"; // 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust according to frontend URL
    credentials: true,
  })
);

app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const secret = process.env.JWT_SECRET;

// 🔹 Google Auth & JWT Token Handling
app.post("/api/auth/google", async (req, res) => {
  try {
    const { uid, name, email, photo } = req.body;
    if (!uid || !name || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, name, email, photo });
      await user.save();
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1d" });

    // Set token in cookies
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // Set secure=true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({ message: "User authenticated", user });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// 🔹 Get User Details (Protected)
app.get("/api/auth/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, });
  res.status(200).json({ message: 'Logged out successfully' });
});


//Update quantity route
app.put("/api/inventory/:id/sell", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) return res.status(400).json({ message: "Invalid quantity" });

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (quantity > item.quantity)
      return res.status(400).json({ message: "Quantity exceeds available stock" });

    item.quantity = quantity;
    await item.save();

    res.json({ success: true, updatedItem: item });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// 🔹 Add Inventory Item (Protected)
app.post("/api/inventory", verifyToken, async (req, res) => {
  try {
    const { itemName, quantity, price, category, description, imageUrl } = req.body;

    const newItem = new Inventory({
      itemName,
      quantity,
      price,
      category,
      description,
      imageUrl,
      userId: req.userId, // Save the user who added the item
    });

    await newItem.save();
    res.status(201).json({ message: "Item added successfully", newItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding inventory", error });
  }
});

// 🔹 Get Inventory Items (Protected)
app.get("/api/inventory/:id", verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.find({ userId: req.params.id });
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error });
  }
});

// 🔹 Delete Inventory Item (Protected)
app.delete("/api/inventory/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Inventory.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting inventory", error });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
