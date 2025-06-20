import { v4 as uuidv4 } from "uuid";
import UserModel from "./userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import TicketModel from "../tickets/ticketModel.js";

const users = [];

export const REGISTER_USER = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6 || !/\d/.test(password)) {
      return res.status(400).json({
        message: "Password must have atleast 6 symbols and 1 number",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(req.body.password, salt);

    const newUser = new UserModel({
      ...req.body,
      id: uuidv4(),
      password: passwordHash,
      bought_tickets: [],
    });

    users.push(newUser);

    const response = new UserModel(newUser);
    const data = await response.save();

    const accessToken = jwt.sign(
      { id: data.id, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { id: data.id, email: data.email },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "User was created successfully",
      user: data,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    const DUPLICATE_ERROR_CODE = 11000;

    if (err.code === DUPLICATE_ERROR_CODE) {
      return res.status(409).json({
        message: "User with this email already exist",
      });
    } else if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
      });
    }
  }
};
export const LOGIN_USER = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    const matchPassword = bcrypt.compareSync(req.body.password, user.password);

    if (!matchPassword || !user) {
      res.status(404).json({
        message: "Wrong password or email",
      });
    }

    const accessToken = jwt.sign(
      { userEmail: user.email, userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Logged in",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const NEW_JWT_TOKEN = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is missing." });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    const userId = decoded.userId;

    const user = await UserModel.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "New JWT token",
      accessToken: newAccessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    console.log(err);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Refresh token expired. Log in over again" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Bad refresh token" });
    } else {
      return res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
};

export const ALL_USERS = async (req, res) => {
  try {
    const users = await UserModel.find({})
      .sort({ name: 1 })
      .select("-password -__v");

    return res.status(200).json({
      users: users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const USER_BY_ID = async (req, res) => {
  try {
    const userId = req.body.id;

    const user = await UserModel.findOne({ id: userId }).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const BUY_TICKET = async (req, res) => {
  try {
    const userId = req.body.userId;
    const ticketId = req.body.ticketId;

    if (!userId || !ticketId) {
      return res.status(400).json({
        message: "User id and Ticket id required",
      });
    }

    const ticket = await TicketModel.findOne({ id: ticketId });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      {
        id: userId,
        balance: { $gte: ticket.price },
      },
      {
        $inc: { balance: -ticket.price },
        $push: { tickets: ticket.id },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(400).json({
        message: "Not enough money to buy this ticket or user not found",
      });
    }
    return res.status(200).json({
      message: "Ticket was bought",
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const USERS_WITH_TICKETS = async (req, res) => {
  try {
    const usersWithTickets = await UserModel.aggregate([
      {
        $lookup: {
          from: "tickets",
          localField: "tickets",
          foreignField: "id",
          as: "userTickets",
        },
      },
      {
        $match: {
          userTickets: { $ne: [] },
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
          userTickets: {
            __v: 0,
          },
        },
      },
    ]);
    return res.status(200).json({
      message: "Users with tickets",
      users: usersWithTickets,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const USER_BY_ID_WITH_TICKETS = async (req, res) => {
  try {
    const userId = req.body.userId;

    const userWithTickets = await UserModel.aggregate([
      {
        $match: { id: userId },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "tickets",
          foreignField: "id",
          as: "userTickets",
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
          userTickets: {
            __v: 0,
          },
        },
      },
    ]);
    return res.status(200).json({
      message: "User by id with tickets",
      user: userWithTickets,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
