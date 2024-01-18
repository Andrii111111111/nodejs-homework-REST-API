import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import gravatar from "gravatar";
import { nanoid } from "nanoid";

import User from "../../models/User.js";

import { ctrlWrapper } from "../../decorators/index.js";
import { HttpError, sendEmail } from "../../helpers/index.js";

const { JWT_SECRET, BASE_URL } = process.env;

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
    const verificationToken = nanoid();
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL: avatarURL,
      verificationToken,
    });
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify your email</a>`,
    };
    await sendEmail(verifyEmail);
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

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw new HttpError(401, "Email not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: " ",
  });

  res.status(200).json({
    message: "Email verify success",
  });
};

const resendVerify = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new HttpError(401, "Email not found"));
  }
  if (user.verify) {
    return next(new HttpError(400, "Email already verify"));
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email^2",
    html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank">Click to verify your email</a>`,
  };
  await sendEmail(verifyEmail);
  res.status(200).json({ message: "Email send success" });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, "Email or password is wrong");
  }
  if (!user.verify) {
    throw new HttpError(401, "Email not verify");
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
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  signin: ctrlWrapper(signin),
  getCurrent,
  signout,
};
