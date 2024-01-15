import Contact, {
  contactAddSchema,
  contactUpDateShema,
  contactUpdateFavoriteSchema,
} from "../models/Contacts.js";
import { HttpError } from "../helpers/index.js";

const getAllContacts = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const result = await Contact.find({ owner }, "-createdAt", {
      skip,
      limit,
    }).populate("owner", "email subscription");
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { contactId: _id } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOne({ _id, owner });

    if (!result) {
      throw HttpError(404, `Not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { error } = contactAddSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { _id: owner } = req.user;
    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
    console.log(req.body);
    console.log(req.file);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req, res, next) => {
  try {
    console.log(req.body);
    const { error } = contactUpDateShema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndUpdate(
      { _id: contactId, owner },
      req.body
    );
    if (!result) {
      throw HttpError(404, `Not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const delById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndDelete({ _id: contactId, owner });
    if (!result) {
      throw HttpError(404, `Not found`);
    }
    res.json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const { error } = contactUpdateFavoriteSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndUpdate(
      { _id: contactId, owner },
      req.body
    );
    if (!result) {
      throw HttpError(404, `Not found`);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllContacts,
  getById,
  addContact,
  updateById,
  delById,
  updateStatusContact,
};
