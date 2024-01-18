import { HttpError } from "../../helpers/index.js";
import Contact from "../../models/Contact.js"; 

const updateById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  try {
    const result = await Contact.findOneAndUpdate(
      { _id: id, owner },
      req.body,
      { new: true }
    );

    if (!result) {
      throw HttpError(404, `Contact with id=${id} not found`);
    }

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export default updateById;
