import express from "express";

import contactsController from "../../controllers/contacts-controller.js";

import { isEmptyBody, isValidId } from "../../middlewares/index.js";

const contactsRouter = express.Router();

contactsRouter.get("/", contactsController.getAllContacts);

contactsRouter.get("/:contactId", isValidId, contactsController.getById);

contactsRouter.post("/", isEmptyBody, contactsController.addContact);

contactsRouter.delete("/:contactId", isValidId, contactsController.delById);

contactsRouter.put(
  "/:contactId",
  isEmptyBody,
  isValidId,
  contactsController.updateById
);

contactsRouter.patch(
  "/:contactId/favorite",
  isValidId,
  isEmptyBody,
  contactsController.updateStatusContact
);

export default contactsRouter;
