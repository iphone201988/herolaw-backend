import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { UserModel } from "../type/Database/types";

export const connectToDB = () => mongoose.connect(process.env.MONGO_URI);

export const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(){}[]:;<>+=?/|";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateOTP = () =>
  otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

export const addMinutesToCurrentTime = (minutes: number) => {
  return new Date().getTime() + minutes * 60000;
};

export const TryCatch =
  (func: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(func(req, res, next)).catch(next);

export const generateJwtToken = (payload: any) => {
  // { expiresIn: "1d" }
  return jwt.sign(payload, process.env.JWT_SECRET);
};

export const getFiles = (req: Request, fileNames: Array<string>) => {
  const files: any = {};
  fileNames.forEach((fileKey: string) => {
    if (req?.files && req.files[fileKey]) {
      files[fileKey] = req.files[fileKey].map((file: any) => file.key);
    }
  });
  if (Object.keys(files).length) return files;

  return null;
};

export const getFileteredUser = (user: UserModel) => {
  return {
    ...user,
    password: undefined,
    unVerifiedTempCredentials: undefined,
    jti: undefined,
    otp: undefined,
    otpExpiry: undefined,
    otpVerified: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    __v: undefined,
    socialType: undefined,
    deviceToken: undefined,
    deviceType: undefined,
    voipToken: undefined,
    isInVideoCall: undefined,
    isVerified: undefined,
  };
};

type ResponseData = Record<string, any>;

// SUCCESS function
export const SUCCESS = (
  res: Response,
  status: number,
  message: string,
  data?: ResponseData
): ResponseData => {
  return res.status(status).json({
    success: true,
    message,
    ...(data ? data : {}),
  });
};

