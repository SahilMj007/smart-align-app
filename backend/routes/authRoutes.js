const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { resetPasswordTemplate } = require("../utils/resetPasswordTemplate");
const { otpEmailTemplate } = require("../utils/otpTemplate");
const User = require("../models/user");
const Otp = require("../models/Otp");

const router = express.Router();

/* ======================
   EMAIL CONFIG (GMAIL)
====================== */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


transporter.verify((err) => {
  if (err) console.error("EMAIL ERROR:", err);
  else console.log("EMAIL SERVER READY");
});

/* ======================
   SEND OTP
====================== */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

await transporter.sendMail({
  from: `"Smart Align" <no-reply@smartalignbiz.netlify.app>`,
  to: email,
  subject: "Your Smart Align OTP",
  html: otpEmailTemplate({
    name: "User",
    otp
  })
});



    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ======================
   VERIFY OTP
====================== */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    await Otp.deleteMany({ email });
    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
});

/* ======================
   SIGNUP
====================== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;


    if (!name || !email || !phone || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });
    
    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      phone,
      password: hash,
      role: "user"
    });

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================
   FORGOT PASSWORD
====================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.json({ message: "If email exists, link sent" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
  

    const link = `${process.env.FRONTEND_URL}/reset.html?token=${token}`;

   await transporter.sendMail({
 from: `"Smart Align" <no-reply@smartalignbiz.netlify.app>`,

  to: email,
  subject: "Reset Your Smart Align Password",
  html: resetPasswordTemplate({
    name: user.name,
    link
  })
});



    res.json({ message: "Reset link sent" });
  } catch (err) {
  console.error("FORGOT PASSWORD ERROR:", err);
  res.status(500).json({ message: err.message });
}
});

/* ======================
   RESET PASSWORD
====================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save({ validateBeforeSave: false });


    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
});

module.exports = router;
