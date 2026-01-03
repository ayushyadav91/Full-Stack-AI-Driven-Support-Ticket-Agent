import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { inngest } from "../AgentEvents/client.js";
import { sendEmail } from "../services/mailer.js";

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    //Fire inngest event
    const user = new User({
      email,
      password: hashed,
      skills,
    });

    await user.save();

    await inngest.send({
      name: "user/signup",
      data: { email },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.status(200).json({
      message: "Login successful",
      user,
      token
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }
    // const token = req.headers.authorization.split(" ")[1];
    // if(!token) return res.status(401).json({error:"Unauthorized User"});
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Unauthorized User" });
    });
    res.json({ message: "Logout successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  console.log(req.body);
  try {
    console.log(req.user.role);
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden:Only admin can update user details" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    await User.updateOne(
      { email },
      {
        skills: skills.length ? skills : user.skills,
        role: role || user.role
      }
    );
    return res.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Updation failed" });
  }
}

export const getUser = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden:Only admin can access user details" });
    }
    const users = await User.find().select("-password");
    res.json({ users });
  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "User find failed" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Generate reset token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the token before saving
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Set token and expiry (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send email with reset code
    await sendEmail({
      to: email,
      subject: "Password Reset Code - TicketAI",
      text: `Your password reset code is: ${resetToken}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Password Reset Request</h2>
                    <p>You requested to reset your password for TicketAI.</p>
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #6B7280;">Your reset code is:</p>
                        <h1 style="margin: 10px 0; color: #4F46E5; font-size: 32px; letter-spacing: 4px;">${resetToken}</h1>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">This code will expire in 15 minutes.</p>
                    <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
    });

    res.json({
      message: "Password reset code sent to your email",
      email: email
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: "Email, reset code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if token exists and hasn't expired
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ error: "No password reset request found" });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ error: "Reset code has expired. Please request a new one" });
    }

    // Verify the reset token
    const isValidToken = await bcrypt.compare(resetToken, user.resetPasswordToken);
    if (!isValidToken) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful. You can now login with your new password" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
