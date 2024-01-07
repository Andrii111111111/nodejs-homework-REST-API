import jwt from "jsonwebtoken";

import User from "../models/User.js";

import { HttpError } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    console.log("Authorization header not found");
    return next(new HttpError(401, "Authorization header not found"));
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    console.log("Invalid Bearer format");
    return next(new HttpError(401, "Invalid Bearer format"));
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);

    if (!user || !user.token || user.token !== token) {
      console.log("User not found");
      return next(new HttpError(401, "User not authorized"));
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication failed:", error.message);
    return next(new HttpError(401, error.message));
  }
};

export default ctrlWrapper(authenticate);
