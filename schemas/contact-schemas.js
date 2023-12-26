import Joi from "joi";

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

const upDateShema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
});

const customMessages = {
  "string.email": `Enter correct email`,
  "any.required": "missing required {#label} field",
};

export const contactAddSchema = addSchema.messages(customMessages);
export const contactUpDateShema = upDateShema.messages(customMessages);
