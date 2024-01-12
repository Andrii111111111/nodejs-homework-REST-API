import { Schema, model } from "mongoose";
import { handleSaveError, preUpdate } from "./hooks.js";
import gravatar from "gravatar";
import Joi from "joi";

const emailRegexp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set a password for the user"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: {
      type: String,
    },
    token: String,
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.avatarURL = gravatar.url(this.email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });
  }
  next();
});

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", preUpdate);

userSchema.post("findOneAndUpdate", handleSaveError);

export const userSignupSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

// Попробуем получить существующую модель
let User;

try {
  User = model("user");
} catch (error) {
  // Если модель не существует, определите ее
  User = model("user", userSchema);
}

export default User;

// import { Schema, model } from "mongoose";
// import { handleSaveError, preUpdate } from "./hooks.js";
// import gravatar from "gravatar";
// import Joi from "joi";

// const emailRegexp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// const userSchema = new Schema(
//   {
//     password: {
//       type: String,
//       required: [true, "Set password for user"],
//     },
//     email: {
//       type: String,
//       // match: emailRegexp,
//       unique: true,
//       required: true,
//     },
//     subscription: {
//       type: String,
//       enum: ["starter", "pro", "business"],
//       default: "starter",
//     },
//     avatarURL: {
//       type: String,
//     },
//     token: String,
//   },
//   { versionKey: false, timestamps: true }
// );

// userSchema.pre("save", function (next) {
//   if (this.isModified("email")) {
//     this.avatarURL = gravatar.url(this.email, {
//       s: "200",
//       r: "pg",
//       d: "identicon",
//     });
//   }
//   next();
// });

// userSchema.post("save", handleSaveError);

// userSchema.pre("findOneAndUpdate", preUpdate);

// userSchema.post("findOneAndUpdate", handleSaveError);

// export const userSignupSchema = Joi.object({
//   email: Joi.string().pattern(emailRegexp).required(),
//   password: Joi.string().min(6).required(),
// });

// export const userSigninSchema = Joi.object({
//   email: Joi.string().pattern(emailRegexp).required(),
//   password: Joi.string().min(6).required(),
// });

// const User = model("user", userSchema);

// export default User;
