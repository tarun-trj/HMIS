import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//import {User} from "../models/test.js";  // Ensure the correct file path
import dotenv from "dotenv";
import Patient from "../models/patient.js";
import Employee from "../models/employee.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
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
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.tokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

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
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.tokenExpiry = null;
    await user.save();

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
    
    if(userType=="patient"){
      user = await Patient.findOne({ email });
    }
    else{
      user = await Employee.findOne({ email });
    }
    

    // const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "Lax" });

    if(userType=="patient")res.json({ accessToken, role: "patient" });
    else res.json({ accessToken, role: user.role });

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
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

export default router;
