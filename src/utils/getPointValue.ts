import User from "../model/user.model";
import { userRole } from "../utils/enums";

export const getAdminPointValue = async (): Promise<number | null> => {
  const admin = await User.findOne(
    {
      email: "admin@yopmail.com",
      role: userRole.ADMIN,
      isDeleted: false,
    },
    {
      pointValue: 1,
      _id: 0,
    }
  ).lean();

  return admin?.pointValue ?? null;
};
