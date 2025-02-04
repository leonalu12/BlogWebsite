import express from "express";

const router = express.Router();

// import child routes
import commentRouter from "./api-comment.js";
router.use("/comments", commentRouter);


export default router;
