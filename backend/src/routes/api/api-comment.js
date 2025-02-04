import express from "express";
import { getCommentsWithArticleId, addComment, deleteComment, likeComment, unlikeComment, getCommentLikes } from "../../data/comment-dao.js";

const router = express.Router();

//get comments by article id
router.get("/:articleId", async (req, res) => {
    try {
        const comments = await getCommentsWithArticleId(req.params.articleId);
  res.json(comments);
    } catch (err) {
        res.status(500).json({ message: "fail to get comments." });
    }
});

//create comment
router.post("/", async (req, res) => {
  try{
    const { content, layer, date_time, user_id, article_id, parent_cid } = req.body;
    if (!content) {
        return res.status(400);
    }
  const newComment = await addComment(content, layer, date_time, user_id, article_id, parent_cid);
  return res.status(201).json(newComment);}
  catch(err){
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
});

//delete comment
router.delete("/:id", async(req, res) => {
    try {
        const comment_id = req.params.id;
        await deleteComment(comment_id);
        return res.json({message:"comment and all replies deleted."});
    } catch (err) {
        res.status(500);
    }
});

//like comment
router.post("/:id/like", async (req, res) => {
    try {
      const { userId } = req.body;
      const success = await likeComment(userId, req.params.id);
      res.json({ liked: success });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

//unlike comment
router.delete("/:id/like", async (req, res) => {
    try {
      const { userId } = req.body;
      await unlikeArticle(userId, req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

//get likes number
router.get("/:commentId/likes", async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const likes = await getCommentLikes(commentId);
        res.json({ likes });
    } catch (err) {
        res.status(500).json({ message: "fail to get likes number." });
    }
});


export default router;
