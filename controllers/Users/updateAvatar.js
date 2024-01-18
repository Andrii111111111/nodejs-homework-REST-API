import path from "path";
import { promises as fs } from "fs";
import multer from "multer";
import jimp from "jimp";
import HttpError from "../../helpers/httpError.js";
import User from "../../models/User.js";

const destination = path.resolve("temp");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, dest: destination });

const updateAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Not authorized" });
    }

    upload.single("avatar")(req, res, async (err) => {
      if (err) {
        console.error("Error during file upload:", err);
        return next(new HttpError(400, "Bad Request"));
      }

      if (!req.file) {
        console.log("No file uploaded");
        return next(new HttpError(400, "No file uploaded"));
      }

      const image = await jimp.read(req.file.buffer);
      await image.resize(250, 250);

      const uniqueFilename = `${
        user._id
      }-${Date.now()}.${image.getExtension()}`;

      console.log("Unique filename:", uniqueFilename);

      const imagePath = path.join(destination, uniqueFilename);
      await image.writeAsync(imagePath);
      console.log("Image saved to temporary directory:", imagePath);

      const targetPath = path.join(
        process.cwd(),
        "public",
        "avatars",
        uniqueFilename
      );
      await fs.rename(imagePath, targetPath);
      console.log("Image moved to public/avatars:", targetPath);

      const avatarURL = `/avatars/${uniqueFilename}`;
      user.avatarURL = avatarURL;
      await user.save();

      console.log("Avatar URL:", avatarURL);
      res.status(200).json({ avatarURL });
    });
  } catch (error) {
    console.error("Error during avatar update:", error);
    next(new HttpError(500, "Internal Server Error"));
  }
};

export default updateAvatar;
