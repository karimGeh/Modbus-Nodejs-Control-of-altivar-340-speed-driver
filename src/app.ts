import express from "express";
import "express-async-errors";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { mainRouter } from "./routes";

declare global {
  namespace Express {
    interface Request {}
  }
}

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.use(morgan("dev"));

// routes - start
app.use("/api/v1", mainRouter);
app.use("/", express.static(path.join(__dirname, "..", "client")));

//! routes - end
//!

app.all("*", async (_, res) => {
  return res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

export default app;
