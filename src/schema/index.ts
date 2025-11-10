import Joi from "joi";

export const stringValidation = (key: string, isRequired: boolean = true) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.string()
      .required()
      .messages({
        "string.empty": `${key} cannot be empty.`,
        "string.base": `${key} should be a type of text`,
        "any.required": `${key} is required`,
      });
  } else {
    schema = Joi.string()
      .optional()
      .messages({
        "string.empty": `${key} cannot be empty.`,
        "string.base": `${key} should be a type of text`,
      });
  }

  return schema;
};

export const string = (key: string, isRequired: boolean = true) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.string()
      .required()
      .messages({
        "string.empty": `${key} cannot be empty.`,
        "string.base": `${key} should be a type of text`,
        "any.required": `${key} is required`,
      });
  } else {
    schema = Joi.string()
      .optional()
      .messages({
        "string.empty": `${key} cannot be empty.`,
        "string.base": `${key} should be a type of text`,
      });
  }

  return schema;
};

export const numberValidation = (
  key: string,
  isRequired: boolean = true,
  min: number = 0
) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.number()
      .min(min)
      .required()
      .messages({
        "number.base": `${key} must be a number.`,
        "number.min": `${key} must be at least ${min}.`,
        "any.required": `${key} is required.`,
      });
  } else {
    schema = Joi.number()
      .min(min)
      .optional()
      .messages({
        "number.base": `${key} must be a number.`,
        "number.min": `${key} must be at least ${min}.`,
      });
  }
  return schema;
};

export const ObjectIdValidation = (key: string, isRequired: boolean = true) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.base": `${key} should be a type of text`,
        "string.empty": `${key} cannot be empty`,
        "string.pattern.base": `${key} must be a valid ObjectId`,
        "any.required": `${key} is required.`,
      });
  } else {
    schema = Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        "string.base": `${key} should be a type of text`,
        "string.empty": `${key} cannot be empty`,
        "string.pattern.base": `${key} must be a valid ObjectId`,
      });
  }
  return schema;
};

export const passwordValidation = (key: string = "Password") => {
  return Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      "string.base": `${key} should be a type of text.`,
      "string.empty": `${key} cannot be empty.`,
      "string.min": `${key} should have at least 6 characters.`,
      "string.max": `${key} should not exceed 50 characters.`,
      "any.required": `${key} is required.`,
    });
};

export const emailValidation = (isRequired: boolean = true) => {
  let schema: any;
  if (isRequired) {
    schema = Joi.string().required().email().messages({
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
      "any.required": `Email is required`,
    });
  } else {
    schema = Joi.string().optional().email().messages({
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
    });
  }
  return schema;
};

export const countryCodeValidation = (isRequired: boolean = true) => {
  let schema: any = Joi.string()
    .pattern(/^\+\d{1,4}$/)
    .messages({
      "string.pattern.base": "Country code must start with + followed by 1 to 4 digits.",
      "string.base": "Country code should be a type of text",
      "string.empty": "Country code cannot be empty.",
    });

  if (isRequired) {
    schema = schema.required().messages({
      "any.required": "Country code is required.",
    });
  } else {
    schema = schema.optional();
  }

  return schema;
};

export const phoneValidation = (isRequired: boolean = true) => {
  let schema: any = Joi.string()
    .pattern(/^\d{6,15}$/)
    .messages({
      "string.pattern.base": "Phone must contain 6 to 15 digits.",
      "string.base": "Phone should be a type of text",
      "string.empty": "Phone cannot be empty.",
    });

  if (isRequired) {
    schema = schema.required().messages({
      "any.required": "Phone is required.",
    });
  } else {
    schema = schema.optional();
  }

  return schema;
};

