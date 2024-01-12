import Contact from "../../models/Contact.js";
import { HttpError } from "../../helpers/index.js";

const addContact = async (req, res, next) => {
  if (!req.user) {
    return next(new HttpError(401, "Not authorized"));
  }

  const { _id: owner } = req.user;

  try {
    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
  } catch (error) {
    next(new HttpError(500, "Internal Server Error"));
  }
};

export default addContact;
