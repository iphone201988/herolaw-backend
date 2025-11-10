import express from "express";
import adminController from "../controllers/admin.controller";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";
import validate from "../middleware/validate.middleware";
import adminSchema from "../schema/admin.schema";

const adminRouter = express.Router();

adminRouter.post(
  "/login",
  validate(adminSchema.loginAdminSchema),
  adminController.adminLogin
);

adminRouter.get(
  "/attorneys",
  adminAuthMiddleware,
  adminController.getAttorneys
);

adminRouter.post(
  "/attorneys",
  adminAuthMiddleware,
  validate(adminSchema.createAttorneySchema),
  adminController.createAttorney
);

adminRouter.put(
  "/attorneys/:attorneyId",
  adminAuthMiddleware,
  validate(adminSchema.updateAttorneySchema),
  adminController.updateAttorney
);

adminRouter.delete(
  "/attorneys/:attorneyId",
  adminAuthMiddleware,
  validate(adminSchema.attorneyIdParamsSchema),
  adminController.deleteAttorney
);

export default adminRouter;

