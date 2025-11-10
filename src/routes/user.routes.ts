import express from "express";
import userController from "../controllers/user.controller";
import validate from "../middleware/validate.middleware";
import userSchema from "../schema/user.schema";
import { authenticationMiddleware } from "../middleware/auth.middleware";

const userRouter = express.Router();

userRouter.post(
  "/",
  validate(userSchema.registerUserSchema),
  userController.register
);

userRouter.put(
  "/verifyOtp",
  validate(userSchema.verifyOTPSchema),
  userController.verifyOtp
);

userRouter.put(
  "/sendOtp",
  validate(userSchema.sendOTPSchema),
  userController.sendOtp
);

userRouter.post(
  "/login",
  validate(userSchema.loginSchema),
  userController.login
);

userRouter.post(
  "/socialLogin",
  validate(userSchema.socialLoginSchema),
  userController.socialLogin
);

userRouter.put(
  "/changePassword",
  validate(userSchema.changePasswordSchema),
  userController.changePassword
);

userRouter.get("/", authenticationMiddleware, userController.getUser);

userRouter.get("/logout", authenticationMiddleware, userController.logout);

export default userRouter;

