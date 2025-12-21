import bcrypt from "bcryptjs";
import jwt, { decode } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
    try {
        const { email, password,skills = [] } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
             email,
             password: hashedPassword,
              skills });

        // Trigger Inngest event
        await inngest.send(
            { name:"/user/signup", 
                data: { email: newUser.email }
        });
      const token = jwt.sign({ _id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN ,
        });
        res.status(201)
        .json({
            token,
            user: newUser,
             message: "User created successfully" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
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
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN ,
        });
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
    try{
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