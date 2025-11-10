import express, { Request, Response } from "express";
import "dotenv/config";
import morgan from "morgan";
import { errorMiddleware } from "./middleware/error.middleware";
import router from "./routes/index";
import path from "path";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../src/uploads")));

app.use("/api/v1", router);

app.get("/health", async (req: Request, res: Response) => {
  console.log("=============Health check");
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("*", async (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

export default app;

