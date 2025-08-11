import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./DB/Database.js";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./Routes/UserRoutes.js";
const app = express();

await connectDB();
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.write(`<h1>Server is Running</h1>`);
  res.send();
});

//Routes

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);

app.listen(5000, (req, res) => {
  console.log("Server is running on : 5000");
});
