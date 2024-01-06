import Contact, {
  contactAddSchema,
  contactUpDateShema,
  contactUpdateFavoriteSchema,
} from "../models/Contacts.js";

// import contactsService from "../models/contacts/index.js";
import { HttpError } from "../helpers/index.js";

const getAllContacts = async (req, res, next) => {
  try {
    const result = await Contact.find();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    console.log(contactId);
    const result = await Contact.findById(contactId);
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
    const result = await Contact.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateById = async (req, res, next) => {
  try {
    const { error } = contactUpDateShema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(
      { _id: contactId },
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
    const result = await Contact.findByIdAndDelete({ _id: contactId });
    if (!result) {
      throw HttpError(404, `Not found`);
    }
    res.json({ message: "contact deleted" }); // якщо res.status(204).json({message: 'contact deleted'}) - тіло не передається
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
    const result = await Contact.findByIdAndUpdate(
      { _id: contactId },
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
