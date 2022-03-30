import express from "express";
import AuthRoute from "./routes/auth";

const app = express();

app.listen(3000, () => console.log("API turned on!"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", AuthRoute);
