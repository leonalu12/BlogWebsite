import express from "express";

const router = express.Router();

// import child routes
import articleRouter from "./api-article.js";
router.use("/articles", articleRouter);


import userRouter from "./api-user.js";
router.use("/users", userRouter);

import authRouter from "./api-auth.js";
router.use("/auth", authRouter);

import commentRouter from "./api-comment.js";
router.use("/comments", commentRouter);

import adminRouter from "./api-admin.js";
router.use("/admins", adminRouter);

export default router;
