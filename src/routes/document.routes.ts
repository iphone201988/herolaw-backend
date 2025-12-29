import express from "express";
import documentsController from "../controllers/documents.controller";

const documentRouter = express.Router();

documentRouter.post("/upload", documentsController.createClioDocument);

export default documentRouter;