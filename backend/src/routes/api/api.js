import express from "express";

const router = express.Router();

// import child routes

import userRouter from "./api-user.js";
router.use("/users", userRouter);

import authRouter from "./api-auth.js";
router.use("/auth", authRouter);

export default router;
