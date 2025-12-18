import express from "express";
import clioController from "../controllers/clio.controller";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";
import validate from "../middleware/validate.middleware";
import { authenticationMiddleware } from "../middleware/auth.middleware";

const clioRouter = express.Router();

clioRouter.get(
  "/users",
 adminAuthMiddleware,
  clioController.fetchClioContacts
);
clioRouter.get(
  "/hero-users",
 adminAuthMiddleware,
  clioController.fetchUsers
);

clioRouter.post(
    "/create-clio-contact/:id",
    adminAuthMiddleware,
    clioController.createClioContactForUser
)
clioRouter.post(
    "/assign",
    adminAuthMiddleware,
    clioController.assignClioContactToUser
)
clioRouter.get(
    "/dashboard",
    adminAuthMiddleware,
    clioController.fetchDashboardData
)

clioRouter.post(
  "/activity-description",
  adminAuthMiddleware,
  clioController.createClioActivityDescription
)

clioRouter.get(
  "/activity-description",
  adminAuthMiddleware,
  clioController.getClioActivityDescriptions
)

clioRouter.put(
  "/activity-description/:id",
  adminAuthMiddleware,
  clioController.updateClioActivityDescription
)


clioRouter.delete(
  "/activity-description/:id",
  adminAuthMiddleware,
  clioController.deleteClioActivityDescription
)

export default clioRouter