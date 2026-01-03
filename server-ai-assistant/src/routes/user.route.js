import express from "express";
const userRouter = express.Router();

import { signup, login, logout, updateUser, getOwnProfile, updateOwnProfile, getUser, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.config.js";



userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", logout);

userRouter.post("/update-user", authenticate, updateUser);
userRouter.get("/profile", authenticate, getOwnProfile);
userRouter.put("/update-profile", authenticate, upload.single('profilePicture'), updateOwnProfile);
userRouter.get("/users", authenticate, getUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);



export default userRouter;