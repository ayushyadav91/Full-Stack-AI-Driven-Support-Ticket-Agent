

//importing  
import express from 'express'
import { connectDB } from  "./database/db.database.js"
import {serve} from "inngest/express";
import {inngest} from "./AgentEvents/client.js"
import { onUserSignUp } from './AgentEvents/functions/on-signup.js';
import { onTicketCreated } from './AgentEvents/functions/on-ticket-create.js';



const app = express();
// Connect to the database
connectDB().then(() => {
    console.log("MongoDB connected");
}).catch((error) => {
    console.log("MongoDB connection error", error);
});


//middleware
app.use(express.json({
    limit: '16kb'
}));
app.use(express.urlencoded({ 
    limit: '16kb',
    extended: true }))
app.use(express.static('public'))


//Inggest 
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignUp, onTicketCreated],
  })
);


//checking route
app.get('/', (req, res) => {
    res.send('Hello World!')
});


export default app