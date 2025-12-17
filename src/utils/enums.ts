export const deviceType = {
  IOS: 1,
  ANDROID: 2,
};

export const userRole = {
  USER: "user",
  ATTORNEY: "attorney",
  ADMIN: "admin",
  CARETAKER:"caretaker"
} as const;

export const adminRoles = {
  SUB_ADMIN: "subAdmin",
  ADMIN: "admin",
};

export const status = {
  SUCCESS: "success",
  FAILED: "failed",
  PENDING: "pending",
};

export const logActions = {
  LOGIN: "login",
  FAILED: "failed",
  PENDING: "pending",
};

export const gender = {
  MALE: "male",
  FEMALE: "female",
  OTHERS: "others",
  ANYONE: "anyone",
};

export const ageGroup = {
  "18-30": "18-30",
  "31-50": "31-50",
  "51-70": "51-70",
  "70-90": "70-90",
};

export const drinkHabbit = {
  FREQUENTLY: "frequently",
  SOCIALLY: "socially",
  RARELY: "rarely",
  NEVER: "never",
};

export const visibilityEnum = {
  PUBLIC: "public",
  HIDE: "hide",
};

export const socialTypeEnums = {
  GOOGLE: 1,
  FACEBOOK: 2,
  APPLE: 3,
};

export const messageTypeEnum = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
};

export const reportTypeEnum = {
  CATFISHING: "catfishing",
  ABUSIVE_BEHAVIOUR: "abusive_behaviour",
  INAPPROPRIATE_CHAT: "inappropriate_chat",
  HARASSMENT: "harassment",
  FAKE_PROFILES: "fake_profiles",
  SAFETY_CONCERNS: "safety_concerns",
  OTHERS: "others",
};

export const reportStatusEnum = {
  PENDING: "pending",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
};

//Notification
export const notificationType = {
  VIDEO_CALL: "video_call",
  MATCH: "match",
  CHAT: "chat",
  LIKE: "like",
};

