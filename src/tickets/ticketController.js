import { v4 as uuidv4 } from "uuid";
import TicketModel from "./ticketModel.js";

const tickets = [];

export const INSERT_TICKET = async (req, res) => {
  try {
    const existingTicket = await TicketModel.findOne({ title: req.body.title });

    if (existingTicket) {
      return res.status(404).json({
        message: `Ticket ${req.body.title} already exist`,
      });
    }

    const ticket = {
      ...req.body,
      id: uuidv4(),
    };

    const response = new TicketModel(ticket);

    const data = await response.save();

    tickets.push(ticket);

    res.status(201).json({
      message: "Ticket was added",
      ticket: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "There is error",
    });
  }
};