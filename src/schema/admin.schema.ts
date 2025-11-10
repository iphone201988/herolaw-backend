import Joi from "joi";
import {
  countryCodeValidation,
  emailValidation,
  ObjectIdValidation,
  passwordValidation,
  phoneValidation,
  stringValidation,
} from ".";

const loginAdminSchema = {
  body: Joi.object({
    email: emailValidation(),
    password: passwordValidation(),
  }),
};

const createAttorneySchema = {
  body: Joi.object({
    name: stringValidation("Name"),
    lastName: stringValidation("Last Name"),
    email: emailValidation(),
    countryCode: countryCodeValidation(),
    phone: phoneValidation(),
    physicalAddress: stringValidation("Physical Address", false),
    mailingAddress: stringValidation("Mailing Address", false),
  }),
};

const attorneyIdParamsSchema = {
  params: Joi.object({
    attorneyId: ObjectIdValidation("Attorney ID"),
  }),
};

const updateAttorneySchema = {
  params: Joi.object({
    attorneyId: ObjectIdValidation("Attorney ID"),
  }),
  body: Joi.object({
    name: stringValidation("Name", false),
    lastName: stringValidation("Last Name", false),
    email: emailValidation(false),
    countryCode: countryCodeValidation(false),
    phone: phoneValidation(false),
    password: passwordValidation().optional(),
    physicalAddress: stringValidation("Physical Address", false),
    mailingAddress: stringValidation("Mailing Address", false),
  }).min(1),
};

export default {
  loginAdminSchema,
  createAttorneySchema,
  updateAttorneySchema,
  attorneyIdParamsSchema,
};

