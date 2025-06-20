import express from "express";
import loginSchema from "./userSchema.js";
import validate from "../middlewares/validation.js";
import auth from "../middlewares/auth.js";

import {
  REGISTER_USER,
  LOGIN_USER,
  NEW_JWT_TOKEN,
  ALL_USERS,
  USER_BY_ID,
  BUY_TICKET,
  USERS_WITH_TICKETS,
  USER_BY_ID_WITH_TICKETS,
} from "./userController.js";

const userRouter = express.Router();

userRouter.post("/", REGISTER_USER);
userRouter.post("/login", validate(loginSchema), LOGIN_USER);
userRouter.post("/token", NEW_JWT_TOKEN);
userRouter.get("/", auth, ALL_USERS);
userRouter.get("/id", auth, USER_BY_ID);
userRouter.post("/buy", auth, BUY_TICKET);
userRouter.get("/tickets", auth, USERS_WITH_TICKETS);
userRouter.get("/ticket", auth, USER_BY_ID_WITH_TICKETS);

export default userRouter;
