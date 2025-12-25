import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from './app.js';

console.log(process.env.MONGO_URI);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})