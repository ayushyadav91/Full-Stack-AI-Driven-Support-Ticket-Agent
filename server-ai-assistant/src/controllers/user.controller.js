import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { inngest } from "../AgentEvents/client.js";
import  {sendEmail} from "../services/mailer.js";

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
        const { email, password} = req.body;
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

export const logout = async (req,res)=>{
    try{

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
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
             if(err) return res.status(401).json({error:"Unauthorized User"});
        });
        res.json({message:"Logout successfully"});
    } catch(error){
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateUser = async (req, res)=>{
    const {skills=[], role, email} = req.body;
    console.log(req.body);
    try{
        console.log(req.user.role);
       if(req.user?.role !== "admin"){
        return res.status(403).json({message:"Forbidden:Only admin can update user details"});
       } 
       const user = await User.findOne({email});
       if(!user){
        return res.status(401).json({message:"User not found"});
       }
       await User.updateOne(
            {email},
            {skills:skills.length? skills : user.skills,
             role: role || user.role}
        );
      return  res.json({message:"User updated successfully"})
    } catch(error){
        console.error("Error:", error);
        res.status(500).json({ message: "Updation failed" });
    }
}

export const getUser = async (req, res)=>{
    try{
        if(req.user?.role !== "admin"){
            return res.status(403).json({message:"Forbidden:Only admin can access user details"});
        }
        const users = await User.find().select("-password");
        res.json({users});
    }
    catch(error){
        console.error("Error:", error);
        res.status(500).json({ message: "User find failed" });
    }
};