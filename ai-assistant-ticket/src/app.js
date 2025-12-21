import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './db/connect.db.js'


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



//Import Routers
import userRouter from "./routes/user.route.js";
import ticketRouter from './routes/ticket.route.js';


//Use Routes
app.use("/api/auth", userRouter);
app.use("/api/tickets", ticketRouter);




export default app;


