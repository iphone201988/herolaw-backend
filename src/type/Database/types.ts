import { Document, Types } from "mongoose";

export interface UserModel extends Document {
  name: string;
  clioMatterId:string
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  physicalAddress: string;
  mailingAddress: string;
  socialId: string;
  socialType: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  clioContactId?:string;
  deviceToken?: string;
  voipToken: string;
  deviceType?: number | null;
  jti: string;
  otp: number;
  otpExpiry: Date;
  otpVerified: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  isDeactivated: boolean;
  role: "user" | "attorney" | "admin";
  relationship: string;
  country: string;
  gender: string;
  dob: string;
  yourIntellectualDisabilities: [string];
  partnerIntellectualDisabilities: [string];
  bio: string;
  careTakerId: any;
  drink: string;
  likeToDate: string;
  ageGroup: string;
  interests: string[];
  photos: string[];
  profileImage: string;
  careTakerCode: string;
  isRegistrationCompleted: boolean;
  enableNotification: boolean;
  visibility: string;
  pin: {
    code: string;
    enabled: boolean;
  };
  unVerifiedTempCredentials: {
    email: string;
  };
  caretakerPermissions?: CaretakerPermissions;
  createdAt: Date;
  updatedAt: Date;
  lastAppOpendAt: Date;
  // Methods
  //Additional fields
  lookingFor: string;
  openTo: string;
  addLanguage: string;
  zodiac: string;
  education: string;
  familyPlan: string;
  covidVaccine: string;
  personalityType: string;
  communicationStyle: string;
  loveStyle: string;
  pet: string;
  cannabis: string;
  Workout: string;
  dietaryPreferences: string;
  socialMedia: string;
  sleepingHabits: string;
  smoking: string;
  drugs: string;
  blockedBy: any;
  reportedBy: any;
  isInVideoCall: boolean;

  matchPassword(password: string): Promise<boolean>;
}

export interface AdminModel extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions?: AdminPermissions;
  isDeleted: boolean;
  matchPassword(password: string): Promise<boolean>;
}

interface CaretakerPermissions {
  canSeeLikes?: boolean;
  canBlockUser?: boolean;
  canReportUser?: boolean;
  monitorVideoChats?: boolean;
}

interface AdminPermissions {
  [x: string]: any;
  contentModerator?: boolean;
  caretakerManager?: boolean;
  userManager?: boolean;
  roleManager?: boolean;
  analyticsManager?: boolean;
}

