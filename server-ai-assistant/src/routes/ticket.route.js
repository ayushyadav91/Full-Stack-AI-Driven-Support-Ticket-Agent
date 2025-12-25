import express from "express";
const ticketRouter = express.Router();

import { authenticate } from "../middlewares/auth.middleware.js";
import {getTicket, getTickets, createTicket} from "../controllers/ticket.controller.js";


ticketRouter.post("/",authenticate,createTicket);
ticketRouter.get("/",authenticate,getTickets);
ticketRouter.get("/:id",authenticate,getTicket);



export default ticketRouter;