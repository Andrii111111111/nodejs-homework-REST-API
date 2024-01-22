import { Schema, model } from "mongoose";
import Joi from "joi";
import { handleSaveError, addUpdateSettings } from "./hooks.js";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true } 
);

contactSchema.post("save", handleSaveError); 
contactSchema.pre("findOneAndUpdate", addUpdateSettings); 
contactSchema.post("findOneAndUpdate", handleSaveError); 

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const upDateShema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

const UpdateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const customMessages = {
  "string.email": `Enter correct email`,
  "any.required": "missing required {#label} field",
};

const Contact = model("contact", contactSchema);

export const contactAddSchema = addSchema.messages(customMessages);
export const contactUpDateShema = upDateShema.messages(customMessages);
export const contactUpdateFavoriteSchema =
  UpdateFavoriteSchema.messages(customMessages);

export default Contact;
