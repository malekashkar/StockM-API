import { config } from "dotenv";
import express, { Router } from "express";
import AuthRoute from "./routes/api/auth";
import cookieParser from "cookie-parser"
import api from "./routes/api";
import site from "./routes/site";

config();

async function main() {
    const app = express();
    
    let PORT = parseInt(process.env.PORT);
    if (!PORT || isNaN(PORT)) PORT = 3000;
    
    app.listen(PORT, () => {
        console.log(`API listening on port ${PORT}!`);
    });
    
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.use("/api", await api());
    app.use(await site());
}

main();