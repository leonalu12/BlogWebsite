import express from "express";
import { getCommentsWithArticleId, addComment, deleteComment } from "../../data/comment-dao.js";

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
})



export default router;
