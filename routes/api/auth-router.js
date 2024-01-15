import express from "express";

import authController from "../../controllers/auth-controller.js";
import { isEmptyBody, authenticate, upload } from "../../middlewares/index.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  upload.single("avatar"),
  isEmptyBody,
  authController.signup
);

authRouter.post("/login", isEmptyBody, authController.signin);

authRouter.post("/logout", authenticate, authController.signout);

authRouter.get("/current", authenticate, authController.getCarrent);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authController.changeAvatar
); // файл очікуємо в полі 'avatar', всі інші поля текстові

export default authRouter;
