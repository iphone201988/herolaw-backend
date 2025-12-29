import express from "express";
import userRouter from "./user.routes";
import adminRouter from "./admin.routes";
import clioRouter from "./clio.routes";
import documentRouter from "./document.routes";

const router = express.Router();

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/clio",clioRouter)
router.use("/document",documentRouter)

export default router;

