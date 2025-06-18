import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./src/users/userRoutes.js";
import ticketRouter from "./src/tickets/ticketRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_DB_CONNECTION)
  .then(console.log("Connected to DB"))
  .catch((err) => {
    console.log(err);
  });

// app.use("/tickets", ticketRouter)
app.use("/users", userRouter);
app.use("/tickets", ticketRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "This endpoint does not exit",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`App started on port ${process.env.PORT}`);
});
