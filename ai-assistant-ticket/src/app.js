import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connect.db.js';
import {serve} from "inngest/express";
import {inngest} from "./inngest/client.js"
import { onUserSignUp } from './inngest/function/on-signup.js';
import { onTicketCreated } from './inngest/function/on-ticket-create.js';



dotenv.config({
    path: './.env'
});
const app = express();

// Connect to the database
connectDB();

//middlewares
app.use(express.json({

}));
app.use(express.urlencoded({

}));

//Inggest 
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignUp, onTicketCreated],
  })
);



//Import Routers
import userRouter from "./routes/user.route.js";
import ticketRouter from './routes/ticket.route.js';


//Use Routes
app.use("/api/auth", userRouter);
app.use("/api/tickets", ticketRouter);



export default app;


