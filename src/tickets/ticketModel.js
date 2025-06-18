import mongoose from "mongoose";

const ticketSchema = mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  from_location: { type: String, required: true },
  to_location: { type: String, required: true },
  to_location_imageUrl: { type: String, required: true },
});

export default mongoose.model("Ticket", ticketSchema);
