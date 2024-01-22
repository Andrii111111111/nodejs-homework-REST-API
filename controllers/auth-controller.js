import User, { userEmailSchema } from "../models/User.js";
import fs from "fs/promises";
import path from "path";
import { HttpError, sendMail } from "../helpers/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import gravatar from "gravatar";
import Jimp from "jimp";
import ElasticEmail from "@elasticemail/elasticemail-client";
import { nanoid } from "nanoid";

const avatarPath = path.resolve("public");
const avatarDir = path.resolve("public", "avatars");

const { JWT_SECRET, ELASTIC_MAIL_FROM, BASE_URL } = process.env;

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw HttpError(400, "missed required field");
    }
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const httpUrl = gravatar.url(
      email,
      { s: "100", r: "x", d: "retro" },
      false
    );

    const verificationToken = nanoid(10);

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      verificationToken,
      avatarURL: httpUrl,
    });
    const { subscription } = newUser;

    const body = ElasticEmail.EmailMessageData.constructFromObject({
      Recipients: [new ElasticEmail.EmailRecipient("sekawa1131@grassdev.com")],
      Content: {
        Body: [
          ElasticEmail.BodyPart.constructFromObject({
            ContentType: "HTML",
            Content: `<a href="${BASE_URL}/users/verify/${verificationToken}" target="_blank">Click on the link to verify</a>`,
          }),
        ],
        Subject: "Verify email",
        From: ELASTIC_MAIL_FROM,
      },
    });

    sendMail(body);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw HttpError(404, "User not found");
    }

    await User.findOneAndUpdate(user._id, {
      verificationToken: "null",
      verify: true,
    });

    res.json({
      message: `Verification successful`,
    });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res, next) => {
  try {
    const { error } = userEmailSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing required field email");
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(404, "Not found");
    }
    console.log(user.verify);
    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    const body = ElasticEmail.EmailMessageData.constructFromObject({
      Recipients: [new ElasticEmail.EmailRecipient("sekawa1131@grassdev.com")],
      Content: {
        Body: [
          ElasticEmail.BodyPart.constructFromObject({
            ContentType: "HTML",
            Content: `<a href="${BASE_URL}/users/verify/${user.verificationToken}" target="_blank">Click on the link to verify</a>`,
          }),
        ],
        Subject: "Verify email",
        From: ELASTIC_MAIL_FROM,
      },
    });

    await sendMail(body);

    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!email || !password) {
      throw HttpError(400, "missing required field");
    }
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const { _id: id, subscription, verify } = user;
    if (!verify) {
      res.status(401).json({
        message: "You are not verified",
      });
      return;
    }
    const payload = {
      id,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(id, { token });
    res.json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCarrent = async (req, res) => {
  try {
    const { email, subscription } = req.user;
    if (!email || !subscription) {
      throw HttpError(401, "Not authorized");
    }
    res.json({
      email,
      subscription,
    });
  } catch (error) {
    // eslint-disable-next-line no-undef
    next(error);
  }
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};

const changeAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "avatar was not sent" });
    }
    const { _id: owner } = req.user;
    const { path: oldPath, filename } = req.file;
    console.log(req.file);
    const newPath = path.join(avatarDir, filename);

    await fs.rename(oldPath, newPath);

    Jimp.read(newPath, (error, image) => {
      if (error) throw error;
      image.resize(250, 250);
      image.write(newPath, (error) => {
        if (error) throw error;
      });
    });
    await User.findOneAndUpdate({ _id: owner }, { avatarURL: `${newPath}` });

    res.status(200).json({
      avatarURL: `${newPath.slice(avatarPath.length)}`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  verify,
  resendVerifyEmail,
  signin,
  getCarrent,
  signout,
  changeAvatar,
};
