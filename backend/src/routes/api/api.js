import express from "express";

const router = express.Router();

// import child routes
import articleRouter from "./api-article.js";
router.use("/article", articleRouter);


export default router;