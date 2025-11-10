import { NextFunction, Request, Response } from "express";
import {
  SUCCESS,
  TryCatch,
  addMinutesToCurrentTime,
  generateJwtToken,
  generateOTP,
  generateRandomString,
  getFileteredUser,
} from "../utils/helper";
import {
  generateUniqueCode,
  getUserByEmail,
  getUserById,
} from "../services/user.services";
import ErrorHandler from "../utils/ErrorHandler";
import User from "../model/user.model";
import { sendEmail } from "../utils/sendEmail";
import { userRole } from "../utils/enums";
import {
  ChangePasswordRequest,
  LoginUserRequest,
  RegisterUserRequest,
  SendOtpRequest,
  SocilLoginRequest,
  VerifyOtpRequest,
} from "../type/API/User/types";

const register = TryCatch(
  async (
    req: Request<{}, {}, RegisterUserRequest>,
    res: Response,
    next: NextFunction
  ) => {
    let {
      name,
      lastName,
      email,
      countryCode,
      phone,
      password,
      physicalAddress,
      mailingAddress,
      longitude,
      latitude,
      deviceToken,
      deviceType,
    } = req.body;
    email = email.toLowerCase();

    let user = await User.findOne({
      email,
      countryCode,
      phone,
    });
    if (user?.isDeleted === false)
      return next(new ErrorHandler("User already exist", 400));
    if (user?.isVerified)
      return next(new ErrorHandler("User already exist", 400));

    if (!user) {
      user = await User.create({
        name,
        lastName,
        email,
        countryCode,
        phone,
        password,
        physicalAddress: physicalAddress || "",
        mailingAddress: mailingAddress || "",
        deviceToken,
        deviceType,
        role: userRole.USER,
      });
    }

    if (latitude && longitude)
      user.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

    const otp = generateOTP();
    user.otp = Number(otp);
    user.otpExpiry = new Date(addMinutesToCurrentTime(2));
    await user.save();
    await sendEmail(email, 1, otp);

    return SUCCESS(res, 201, "Verification code has been sent to your email", {
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  }
);

const verifyOtp = TryCatch(
  async (
    req: Request<{}, {}, VerifyOtpRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, otp, type } = req.body; 
    const user = await getUserById(userId);
    const now = new Date();
    if (user.otpExpiry < now) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return next(new ErrorHandler("OTP has been expired", 400));
    }

    if (user.otp != otp) return next(new ErrorHandler("Invalid OTP", 400));

    user.otp = undefined;
    user.otpExpiry = undefined;
    if (type == 1) user.isVerified = true;
    user.otpVerified = true;
    await user.save();
    return SUCCESS(res, 200, `OTP verified successfully`, {
      data: {
        userId: user._id,
        role: user.role,
      },
    });
  }
);

const sendOtp = TryCatch(
  async (
    req: Request<{}, {}, SendOtpRequest>,
    res: Response,
    next: NextFunction
  ) => {
    let { email, type } = req.body; // Forgot:1,Resend:2,ChangeEmail:3
    const emailTemplate = type == 1 ? 3 : type == 2 ? 4 : 5;
    email = email.toLowerCase();

    let query: any = { email };
    // if (type != 2) query.isVerified = true;
    const user = await User.findOne(query);
    if (!user) return next(new ErrorHandler("User not found", 404));

    const otp = generateOTP();
    user.otp = Number(otp);
    user.otpExpiry = new Date(addMinutesToCurrentTime(2));
    user.otpVerified = false;
    await user.save();
    await sendEmail(user.email, emailTemplate, otp);

    return SUCCESS(
      res,
      200,
      `OTP ${type == 2 ? "resent" : "sent"} successfully`,
      {
        data: { userId: user._id },
      }
    );
  }
);

const login = TryCatch(
  async (
    req: Request<{}, {}, LoginUserRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      email,
      password,
      deviceToken,
      deviceType,
      latitude,
      longitude,
    } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) return next(new ErrorHandler("Invalid credentials", 400));

    const isMatched = await user.matchPassword(password);
    if (!isMatched) return next(new ErrorHandler("Invalid credentials", 400));

    if (latitude && longitude) {
      user.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }
    let token: string = "";
    if (user.isVerified) {
      const jti = generateRandomString(20);
      token = generateJwtToken({ userId: user._id, jti });
      user.jti = jti;
      user.deviceToken = deviceToken;
      user.deviceType = deviceType;
    } else {
      return next(new ErrorHandler("User OTP is not verified", 400));
    }
    await user.save();

    return SUCCESS(res, 200, "LoggedIn successfully", {
      data: {
        token: token ? token : undefined,
        user: getFileteredUser(user.toObject()),
      },
    });
  }
);

const socialLogin = TryCatch(
  async (
    req: Request<{}, {}, SocilLoginRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      socialId,
      email,
      role,
      username,
      profileImage,
      longitude,
      latitude,
      socialType,
      deviceToken,
      deviceType,
      voipToken,
    } = req.body;

    let user = await User.findOne({
      socialId,
      email,
      isDeleted: false,
    });

    let isUserExists = true;

    if (!user) {
      isUserExists = false;
      user = await User.create({
        username,
        email,
        socialId,
        socialType,
      });
    }

    user.deviceToken = deviceToken;
    user.deviceType = deviceType;
    if (voipToken && deviceType == 1) user.voipToken = voipToken;

    if (latitude && longitude)
      user.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

    if (profileImage) user.profileImage = profileImage;

    let token = "";

    if (isUserExists && user.isRegistrationCompleted) {
      const jti = generateRandomString(20);
      user.jti = jti;
      token = generateJwtToken({ userId: user._id, jti });
    }

    if (isUserExists && !user.role && role) {
      const normalizedRole = role.toLowerCase() as Lowercase<string>;
      if (
        Object.values(userRole).includes(
          normalizedRole as (typeof userRole)[keyof typeof userRole]
        )
      ) {
        user.role = normalizedRole as (typeof userRole)[keyof typeof userRole];
        user.isVerified = true;
      }
    }

    await user.save();
    let updatedProfileImage = null;
    if (user?.profileImage) {
      if (user.profileImage.includes("https")) {
        updatedProfileImage = user.profileImage;
      } else {
        updatedProfileImage = process.env.AWS_S3_URI + user.profileImage;
      }
    }

    return SUCCESS(res, 200, "User logged in successfully", {
      data: {
        token: token ? token : null,
        user: {
          ...getFileteredUser(user.toObject()),
          profileImage: updatedProfileImage,
        },
      },
    });
  }
);

const changePassword = TryCatch(
  async (
    req: Request<{}, {}, ChangePasswordRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, password } = req.body;
    const user = await getUserById(userId);

    if (!user.otpVerified && user.isVerified){
      return next(new ErrorHandler("User OTP is not verified", 400));
    }

    user.password = password;
    user.otpVerified = false;
    await user.save();
    return SUCCESS(res, 200, "Password changed successfully");
  }
);

const getUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    return SUCCESS(res, 200, "User fetched successfully", {
      data: {
        user: {
          ...getFileteredUser(user.toObject()),
          profileImage: user.profileImage
            ? user.profileImage.includes("https")
              ? user.profileImage
              : process.env.AWS_S3_URI + user.profileImage
            : null,
        },
      },
    });
  }
);

const logout = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    user.deviceToken = undefined;
    user.deviceType = undefined;
    user.jti = undefined;
    await user.save();
    return SUCCESS(res, 200, "User logged out successfully");
  }
);

export default {
  register,
  verifyOtp,
  sendOtp,
  changePassword,
  login,
  socialLogin,
  getUser,
  logout,
};

