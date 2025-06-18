import express from "express";
import ticketShema from "./ticketSchema.js";
import validate from "../middlewares/validation.js";
import auth from "../middlewares/auth.js";

import { INSERT_TICKET } from "./ticketController.js";

const ticketRouter = express.Router();

ticketRouter.post("/", validate(ticketShema),auth, INSERT_TICKET);

export default ticketRouter;
