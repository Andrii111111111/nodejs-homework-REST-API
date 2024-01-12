import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import gravatar from "gravatar";

import User from "../../models/user.js";

import { ctrlWrapper } from "../../decorators/index.js";
import { HttpError } from "../../helpers/index.js";

const { JWT_SECRET } = process.env;

const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      return next(new HttpError(409, "Email in use"));
    }

    const avatarURL = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL: avatarURL,
    });

    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    next(new HttpError(500, "Internal Server Error"));
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.status(200).json({
    email,
    subscription,
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Signout success",
  });
};

export default {
  register: ctrlWrapper(register),
  signin: ctrlWrapper(signin),
  getCurrent,
  signout,
};
