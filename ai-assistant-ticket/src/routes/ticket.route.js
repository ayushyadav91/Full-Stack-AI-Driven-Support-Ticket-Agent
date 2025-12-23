import express from "express";
const ticketRouter = express.Router();

import { authenticate } from "../middlewares/auth.middlewares.js";
import {getTicket, getTickets, createTicket} from "../controllers/ticket.controller.js"

ticketRouter.get("/",authenticate,getTickets);
ticketRouter.get("/:id",authenticate,getTicket);
ticketRouter.post("/",authenticate,createTicket);


export default ticketRouter;