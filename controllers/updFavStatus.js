import { HttpError } from "../helpers/index.js";
import Contact from "../models/Contact.js";

const updateFavoriteStatus = async (req, res, next) => {
  try {
    const { id: contactId } = req.params;
    const { favorite } = req.body;

    if (favorite === undefined) {
      throw new HttpError(400, 'Missing field "favorite"');
    }

    const updatedContact = await updateStatusContact(contactId, { favorite });

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error(error);
    if (error.jsonMessage) {
      res.status(error.status).json(error.jsonMessage);
    } else {
      next(error);
    }
  }
};

const updateStatusContact = async (contactId, body) => {
  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      throw new HttpError(404, `Contact with id=${contactId} not found`);
    }

    contact.favorite = body.favorite;

    const updatedContact = await contact.save();

    return updatedContact;
  } catch (error) {
    throw new HttpError(500, "Internal Server Error");
  }
};

export default updateFavoriteStatus;
