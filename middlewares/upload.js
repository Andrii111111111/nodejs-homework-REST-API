import multer from "multer";
import path from "path";

import { HttpError } from "../helpers/index.js";

// створюємо налаштування для middleware
const destination = path.resolve("temp");

const storage = multer.diskStorage({
  destination,

  filename: (req, file, callback) => {
    const { _id: owner } = req.user;
    // const uniquePreffix = Date.now();
    const uniquePreffix = owner;
    const fileName = `${uniquePreffix}_${file.originalname}`;
    callback(null, fileName);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 3,
};

// зробимо фільтрацію по розширенню
const fileFilter = (req, file, callback) => {
  const fileExtation = ["jpeg", "png", "bmp", "tiff", "gif", "jpg"];
  const extension = file.originalname.split(".").pop();
  if (!fileExtation.includes(extension)) {
    callback(HttpError(400, "is not valid file extension"));
  }
  callback(null, true);
};

const upload = multer({
  storage,
  limits,
  fileFilter,
});

export default upload;
