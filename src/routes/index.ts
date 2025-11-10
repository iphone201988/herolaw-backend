import express from "express";
import userRouter from "./user.routes";
import adminRouter from "./admin.routes";

const router = express.Router();

router.use("/user", userRouter);
router.use("/admin", adminRouter);

export default router;

