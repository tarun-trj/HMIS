import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//import {User} from "../models/test.js";  // Ensure the correct file path
import dotenv from "dotenv";
import Patient from "../models/patient.js";
import Employee from "../models/employee.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
// routes/resetRoutes.js
import redisClient from "../config/redisClient.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1m" });
    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: "10m" });
    console.log(refreshToken);
    return { accessToken, refreshToken };
};

router.post("/forgot-password", async (req, res) => {
  console.log(1);
  const { email,userType } = req.body;
  try {
    let user;
    if (userType === "patient") user = await Patient.findOne({ email });
    else if (userType === "employee") user = await Employee.findOne({ email });
    else {
      return res.status(400).json({ message: "Invalid or missing userType." });
    }
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

   // Save token -> { email, userType } in Redis with 1-hour expiry
    await redisClient.setEx(
      `reset:${token}`, // key
      900,              // expiry in seconds
      JSON.stringify({ email, userType }) // value
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hmis.iitg@gmail.com",
        pass: "uymo hvwu hzgz ktrm",
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;
    await transporter.sendMail({
      from: '"MyApp Support" hmis.iitg@gmail.com',
      to: user.email,
      subject: "Password Reset",
      html: `<p>You requested a password reset</p><p><a href="${resetLink}">Click here to reset</a></p>`,
    });

    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
});


router.post("/reset-password/:token", async (req, res) => {
  console.log(5);
  const { token } = req.params;
  const { password } = req.body;

  try {
    const tokenData = await redisClient.get(`reset:${token}`);
    if (!tokenData) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
    const { email, userType } = JSON.parse(tokenData); // use what you stored
    console.log(email)
    console.log(userType)
    let user;
    if(userType=="patient") user = await Patient.findOne({ email });
    else user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete token after use
    await redisClient.del(`resetToken:${token}`);

    res.json({ message: "Password has been reset." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
});




// Login
router.post("/login", async (req, res) => {
  const { email, password ,userType} = req.body;
  try {
    let user;
    if(userType=="patient") user = await Patient.findOne({ email });
    else user = await Employee.findOne({ email });
    
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "Lax" });

    if(userType=="patient")res.json({ accessToken, role: "patient" ,user:user});
    else res.json({ accessToken, role: user.role ,user:user});

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Refresh Token
router.post("/refresh", (req, res) => {
    console.log("halwa")
    console.log(req.cookies)
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: "10m" });
    res.json({ accessToken });
  } catch (err) {
    console.log("apple")
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});


export default router;
