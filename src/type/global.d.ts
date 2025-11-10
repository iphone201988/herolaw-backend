import { UserModel, AdminModel } from "./Database/types";

declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
      userId: any;
      adminUser?: UserModel;
    }
  }
}

