import { NextFunction, Request, Response } from "express";
import {
  SUCCESS,
  TryCatch,
  generateJwtToken,
  getFileteredUser,
  generateRandomString,
} from "../utils/helper";
import User from "../model/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import {
  CreateAttorneyRequest,
  LoginAdminRequest,
  UpdateAttorneyRequest,
} from "../type/API/Admin/types";
import { userRole } from "../utils/enums";

const adminLogin = TryCatch(
  async (
    req: Request<{}, {}, LoginAdminRequest>,
    res: Response,
    next: NextFunction
  ) => {
    console.log("admin login");
    const { email, password } = req.body;

    if (email != process.env.ADMIN_EMAIL)
      return next(
        new ErrorHandler("You are not authorized to access the route ", 401)
      );

    let user;
    if (email) user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return next(new ErrorHandler("User not found", 400));

    const isPasswordMatched = await user.matchPassword(password);

    if (!isPasswordMatched)
      return next(new ErrorHandler("Invalid password", 400));

    const token = generateJwtToken({ userId: user._id });
    return SUCCESS(res, 200, "LoggedIn successfully", {
      data: {
        token: token ? token : undefined,
        user: getFileteredUser(user.toObject()),
      },
    });
  }
);

const getAttorneys = TryCatch(
  async (req: Request, res: Response) => {
    const attorneys = await User.find({
      role: userRole.ATTORNEY,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    const formattedAttorneys = attorneys.map((attorney) =>
      getFileteredUser(attorney.toObject())
    );

    return SUCCESS(res, 200, "Attorneys fetched successfully", {
      data: {
        attorneys: formattedAttorneys,
      },
    });
  }
);

const createAttorney = TryCatch(
  async (
    req: Request<{}, {}, CreateAttorneyRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      name,
      lastName,
      email,
      countryCode,
      phone,
      password,
      physicalAddress,
      mailingAddress,
    } = req.body;

    const lowerCaseEmail = email.toLowerCase();

    let user = await User.findOne({ email: lowerCaseEmail });

    if (user && !user.isDeleted) {
      return next(new ErrorHandler("Attorney already exists", 400));
    }

    if (!user) {
      user = new User();
    }

    user.name = name;
    user.lastName = lastName;
    user.email = lowerCaseEmail;
    user.countryCode = countryCode;
    user.phone = phone;
    user.password = password || generateRandomString(12);
    user.physicalAddress = physicalAddress || "";
    user.mailingAddress = mailingAddress || "";
    user.role = userRole.ATTORNEY;
    user.isDeleted = false;
    user.isDeactivated = false;
    user.isVerified = true;
    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.deviceToken = user.deviceToken || "";
    user.deviceType =
      user.deviceType === undefined || user.deviceType === null
        ? null
        : user.deviceType;

    await user.save();

    return SUCCESS(res, 201, "Attorney created successfully", {
      data: {
        attorney: getFileteredUser(user.toObject()),
      },
    });
  }
);

const updateAttorney = TryCatch(
  async (
    req: Request<{ attorneyId: string }, {}, UpdateAttorneyRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { attorneyId } = req.params;
    const {
      name,
      lastName,
      email,
      countryCode,
      phone,
      password,
      physicalAddress,
      mailingAddress,
    } = req.body;

    const attorney = await User.findOne({
      _id: attorneyId,
      role: userRole.ATTORNEY,
      isDeleted: false,
    });

    if (!attorney)
      return next(new ErrorHandler("Attorney not found", 404));

    if (email && email.toLowerCase() !== attorney.email) {
      const lowerCaseEmail = email.toLowerCase();
      const emailExists = await User.findOne({
        email: lowerCaseEmail,
        _id: { $ne: attorneyId },
      });
      if (emailExists)
        return next(new ErrorHandler("Email already in use", 400));
      attorney.email = lowerCaseEmail;
    }

    if (name) attorney.name = name;
    if (lastName) attorney.lastName = lastName;
    if (countryCode) attorney.countryCode = countryCode;
    if (phone) attorney.phone = phone;
    if (physicalAddress !== undefined)
      attorney.physicalAddress = physicalAddress;
    if (mailingAddress !== undefined)
      attorney.mailingAddress = mailingAddress;
    if (password) attorney.password = password;

    await attorney.save();

    return SUCCESS(res, 200, "Attorney updated successfully", {
      data: {
        attorney: getFileteredUser(attorney.toObject()),
      },
    });
  }
);

const deleteAttorney = TryCatch(
  async (
    req: Request<{ attorneyId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { attorneyId } = req.params;

    const attorney = await User.findOne({
      _id: attorneyId,
      role: userRole.ATTORNEY,
      isDeleted: false,
    });

    if (!attorney)
      return next(new ErrorHandler("Attorney not found", 404));

    attorney.isDeleted = true;
    attorney.jti = undefined;
    attorney.deviceToken = "";
    attorney.deviceType = null;

    await attorney.save();

    return SUCCESS(res, 200, "Attorney deleted successfully");
  }
);

export default {
  adminLogin,
  getAttorneys,
  createAttorney,
  updateAttorney,
  deleteAttorney,
};

