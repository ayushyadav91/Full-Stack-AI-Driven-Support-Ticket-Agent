import express from "express";
const userRouter = express.Router();

import {signup, login, logout, updateUser, getUser } from "../controllers/user.controller.js";
import { authenticate  } from "../middlewares/auth.middleware.js";




userRouter.post("/signup", signup);
userRouter.post("/login",login);
userRouter.post("/logout",logout);

userRouter.post("/update-user",authenticate , updateUser);
userRouter.get("/users", authenticate, getUser);



export default userRouter;