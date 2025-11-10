import Joi, { number } from "joi";
import {
  ObjectIdValidation,
  countryCodeValidation,
  emailValidation,
  numberValidation,
  passwordValidation,
  phoneValidation,
  stringValidation,
} from ".";
import {
  deviceType,
  socialTypeEnums,
  userRole,
  visibilityEnum,
} from "../utils/enums";

const registerUserSchema = {
  body: Joi.object({
    name: stringValidation("Name"),
    lastName: stringValidation("Last Name"),
    email: emailValidation(),
    countryCode: countryCodeValidation(),
    phone: phoneValidation(),
    password: passwordValidation(),
    physicalAddress: stringValidation("Physical Address", false),
    mailingAddress: stringValidation("Mailing Address", false),
    latitude: Joi.number().min(-90).max(90).required().messages({
      "any.required": "Latitude is required.",
      "number.base": "Latitude must be a number.",
      "number.min": "Latitude must be between -90 and 90.",
      "number.max": "Latitude must be between -90 and 90.",
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
      "any.required": "Longitude is required.",
      "number.base": "Longitude must be a number.",
      "number.min": "Longitude must be between -180 and 180.",
      "number.max": "Longitude must be between -180 and 180.",
    }),
    deviceToken: stringValidation("Device Token"),
    deviceType: Joi.number()
      .valid(...Object.values(deviceType))
      .required()
      .messages({
        "number.base": `Device Type must be a number.`,
        "any.only": `Device Type must be one of: ${Object.values(
          deviceType
        ).join(", ")}.`,
        "any.required": `Device Type is required.`,
      }),
  }),
};

const verifyOTPSchema = {
  body: Joi.object({
    userId: ObjectIdValidation("UserID"),
    otp: numberValidation("OTP"),
    type: Joi.number().valid(1, 2).required().messages({
      "any.required": "Type is required.",
      "number.base": "Type must be a number.",
      "any.only": "Type must be either 1 or 2.",
    }),
  }),
};

const sendOTPSchema = {
  body: Joi.object({
    email: emailValidation(),
    type: Joi.number().valid(1, 2).required().messages({
      "any.required": "Type is required.",
      "number.base": "Type must be a number.",
      "any.only": "Type must be either 1 or 2.",
    }),
  }),
};



const socialLoginSchema = {
  body: Joi.object({
    socialId: stringValidation("Social ID"),
    email: emailValidation(),
    username: stringValidation("Username"),
    profileImage: stringValidation("Profile Image", false),
    role: Joi.string()
      .valid(...Object.values(userRole))
      .optional()
      .messages({
        "string.base": `Role must be a string.`,
        "any.only": `Role must be one of: ${Object.values(userRole).join(
          ", "
        )}.`,
      }),
    latitude: Joi.number().min(-90).max(90).required().messages({
      "any.required": "Latitude is required.",
      "number.base": "Latitude must be a number.",
      "number.min": "Latitude must be between -90 and 90.",
      "number.max": "Latitude must be between -90 and 90.",
    }),

    longitude: Joi.number().min(-180).max(180).required().messages({
      "any.required": "Longitude is required.",
      "number.base": "Longitude must be a number.",
      "number.min": "Longitude must be between -180 and 180.",
      "number.max": "Longitude must be between -180 and 180.",
    }),
    socialType: Joi.number()
      .valid(...Object.values(socialTypeEnums))
      .required()
      .messages({
        "number.base": `Device Type must be a number.`,
        "any.only": `Device Type must be one of: ${Object.values(
          deviceType
        ).join(", ")}.`,
        "any.required": `Device Type is required.`,
      }),
    deviceToken: stringValidation("Device Token"),
    deviceType: Joi.number()
      .valid(...Object.values(deviceType))
      .required()
      .messages({
        "number.base": `Device Type must be a number.`,
        "any.only": `Device Type must be one of: ${Object.values(
          deviceType
        ).join(", ")}.`,
        "any.required": `Device Type is required.`,
      }),
    voipToken: Joi.string()
      .when("deviceType", {
        is: 1,
        then: Joi.required().messages({
          "any.required": "Voip Token is required when Device Type is 1.",
        }),
        otherwise: Joi.optional(),
      })
      .messages({
        "string.base": "Voip Token must be a type of text",
        "string.empty": "Voip Token cannot be empty",
      }),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: emailValidation(),
    password: passwordValidation(),
    latitude: Joi.number().min(-90).max(90).required().messages({
      "any.required": "Latitude is required.",
      "number.base": "Latitude must be a number.",
      "number.min": "Latitude must be between -90 and 90.",
      "number.max": "Latitude must be between -90 and 90.",
    }),

    longitude: Joi.number().min(-180).max(180).required().messages({
      "any.required": "Longitude is required.",
      "number.base": "Longitude must be a number.",
      "number.min": "Longitude must be between -180 and 180.",
      "number.max": "Longitude must be between -180 and 180.",
    }),
    deviceToken: stringValidation("Device Token"),
    deviceType: Joi.number()
      .valid(...Object.values(deviceType))
      .required()
      .messages({
        "number.base": `Device Type must be a number.`,
        "any.only": `Device Type must be one of: ${Object.values(
          deviceType
        ).join(", ")}.`,
        "any.required": `Device Type is required.`,
      }),
  }),
};

const changeCredentialsSchema = {
  body: Joi.object({
    email: emailValidation(),
  }),
};

const updateUserSchema = {
  body: Joi.object({
    username: stringValidation("Username", false),
    relationship: stringValidation("Relationship", false),
    countryCode: countryCodeValidation(false),
    phone: phoneValidation(false),
    bio: stringValidation("Bio", false),
    yourIntellectualDisabilities: Joi.array()
      .items(Joi.string().required().label("Your Intellectual Disabilities"))
      .label("Your Intellectual Disabilities")
      .optional(),
    interests: stringValidation("Interests", false),
    careTakerId: stringValidation("Care Takers", false),
    enableNotification: Joi.boolean().optional().messages({
      "boolean.base": "Enable Notification must be true or false",
    }),
    visibility: Joi.string()
      .valid(...Object.values(visibilityEnum))
      .optional()
      .messages({
        "any.required": "Visibility is required.",
        "string.empty": "Visibility cannot be empty.",
        "string.base": "Visibility must be a string.",
        "any.only": `Visibility must be one of: ${Object.values(
          visibilityEnum
        ).join(", ")}.`,
      }),
    caretakerPermissions: Joi.object({
      canSeeLikes: Joi.boolean(),
      canBlockUser: Joi.boolean(),
      canReportUser: Joi.boolean(),
      monitorVideoChats: Joi.boolean(),
    }),
  }),
};

const resetPasswordSchema = {
  body: Joi.object({
    oldPassword: passwordValidation("Old Password"),
    newPassword: passwordValidation(),
  }),
};

const searchCareTakerSchema = {
  query: Joi.object({
    careTakerCode: stringValidation("Care Taker Code"),
  }),
};

const getUserProfileSchema = {
  params: Joi.object({
    userId: ObjectIdValidation("UserID"),
  }),
};

const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: passwordValidation("Old Password"),
    newPassword: passwordValidation("New Password"),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    password: passwordValidation(),
    userId: ObjectIdValidation("UserID"),
  }),
};

const addPinSchema = {
  body: Joi.object({
    pin: Joi.object({
      code: Joi.string().pattern(/^[0-9]{4}$/).messages({
        "string.pattern.base": "Pin must be a 4-digit number.",
      }),
      enabled: Joi.boolean().required().messages({
        "any.required": "Enabled status is required.",
      }),
    })
      .required()
      .messages({
        "any.required": "Pin object is required.",
      }),
  }),
};

export default {
  registerUserSchema,
  verifyOTPSchema,
  sendOTPSchema,
  socialLoginSchema,
  loginSchema,
  changeCredentialsSchema,
  updateUserSchema,
  resetPasswordSchema,
  searchCareTakerSchema,
  getUserProfileSchema,
  updatePasswordSchema,
  changePasswordSchema,
  addPinSchema,
};

