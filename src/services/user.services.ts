import User from "../model/user.model";
import { UserModel } from "../type/Database/types";
import ErrorHandler from "../utils/ErrorHandler";
import { userRole } from "../utils/enums";

export const getUserById = async (userId: string): Promise<UserModel> => {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) throw new ErrorHandler("User not found", 400);

  return user;
};

export const getUserByEmail = async (
  email: string
): Promise<UserModel | null> => {
  const user = await User.findOne({
    email,
    isVerified: true,
    isDeleted: false,
  });
  if (!user) return null;
  return user;
};

export const getUserByPhone = async (
  countryCode: string,
  phone: string
): Promise<UserModel | null> => {
  const user = await User.findOne({
    countryCode,
    phone,
    isVerified: true,
    isDeleted: false,
  });
  if (!user) return null;
  return user;
};

export const generateUniqueCode = async () => {
  const maxAttempts = 100; // Limit attempts to prevent infinite loops
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const randomDigits = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    const careTakerCode = `HL-${randomDigits}`;

    try {
      const existingUser = await User.findOne({ careTakerCode });
      if (!existingUser) {
        return careTakerCode;
      }
    } catch (error) {
      console.error("Error checking code uniqueness:", error);
      throw error;
    }
  }
  throw new ErrorHandler(
    `Unable to generate unique code after ${maxAttempts} attempts`,
    500
  );
};

export const getRoleBasedUsers = async (
  user: UserModel
): Promise<Array<string>> => {
  const userId = user._id;
  const isCareTaker = user.role === userRole.CARETAKER;
  const userIds = [];

  if (isCareTaker) {
    const users = await User.find({ careTakerId: { $in: [userId] } }).select(
      "_id"
    );
    users.forEach((user) => {
      userIds.push(user._id);
    });
  } else {
    userIds.push(userId);
  }

  return userIds;
};

