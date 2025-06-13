import express, { json } from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_DB_CONNECTION)
  .then(console.log("Connected to DB"))
  .catch((err) => {
    console.log(err);
  });

app.use((req, res) => {
  res.status(404).json({
    message: "This endpoint does not exit",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`App started on port ${process.env.PORT}`);
});
