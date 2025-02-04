import express from "express";
import { getCommentsWithArticleId, addComment, deleteComment } from "../../data/comment-dao.js";

const router = express.Router();

router.get("/:articleId", async (req, res) => {
    try {
        const comments = await getCommentsWithArticleId(req.params.articleId);
  res.json(comments);
    } catch (err) {
        res.status(500).json({ message: "fail to get comments." });
    }
});

router.post("/", async (req, res) => {
  const { message } = req.body;
  const dbMessage = await addMessage(message);
  return res.status(201).location(`/api/messages/${message.id}`).json(dbMessage);
})

export default router;
