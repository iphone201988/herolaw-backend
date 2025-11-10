import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import {
  deviceType,
  socialTypeEnums,
  userRole,
} from "../utils/enums";
import { UserModel } from "../type/Database/types";

const userSchema = new Schema<UserModel>(
  {
    name: { type: String, require: true },
    lastName: { type: String, require: true },
    email: { type: String, require: true },
    countryCode: { type: String, require: true },
    phone: { type: String, require: true },
    password: { type: String },
    physicalAddress: { type: String, default: "" },
    mailingAddress: { type: String, default: "" },
    socialId: { type: String },
    socialType: {
      type: Number,
      enum: Object.values(socialTypeEnums),
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    deviceToken: { type: String, default: "" },
    deviceType: {
      type: Number,
      enum: [deviceType.IOS, deviceType.ANDROID],
      default: null,
    },
    jti: { type: String },
    otp: { type: Number },
    otpExpiry: { type: Date },
    otpVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.USER,
    } as any,
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function () {
  const user = this as UserModel;
  if (user.isModified("password") && user.password) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  }
});

userSchema.methods.matchPassword = async function (password: string) {
  const user = this as UserModel;
  if (!user.password) return false;
  const isCompared = await bcrypt.compare(password, user.password);
  return isCompared;
};

const User = model<UserModel>("user", userSchema);
export default User;

