import User from "../models/User.js";
import { HttpError } from "../helpers/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const { JWT_SECRET } = process.env;

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
    const newUser = await User.create({ ...req.body, password: hashPassword });
    const { subscription } = newUser;
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

    const { _id: id, subscription } = user;
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

export default {
  signup,
  signin,
  getCarrent,
  signout,
};
