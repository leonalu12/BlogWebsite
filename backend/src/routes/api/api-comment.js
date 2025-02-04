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
    
  const newComment = await addComment(req.body);
  return res.status(201).json(newComment);}
  catch(err){
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
})



export default router;
