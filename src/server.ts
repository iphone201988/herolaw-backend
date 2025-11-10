import "dotenv/config";
import { connectToDB } from "./utils/helper";
import app from "./app";
import http from "http";

const server = http.createServer(app);

connectToDB()
  .then(() => {
    console.log("Connected to DB successfully", process.env.MONGO_URI);
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to DB", error);
  });

