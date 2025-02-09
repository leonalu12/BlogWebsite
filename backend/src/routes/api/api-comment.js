import express from "express";
import { getCommentsWithArticleId, addComment, deleteComment, likeComment, unlikeComment, getCommentLikes,getLayer } from "../../data/comment-dao.js";
import {requiresAuthentication} from "../../middleware/auth-middleware.js";

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
router.post("/", requiresAuthentication, async (req, res) => {
  try{
    const { content, date_time, user_id, article_id, parent_cid } = req.body;
    if (!content) {
        return res.status(400);
    }   
    let layer = 1;
    if(parent_cid){
    const parentLayer= await getLayer(parent_cid);
    layer = parentLayer.layer +1;
  }
  const newComment = await addComment(content, layer, date_time, user_id, article_id, parent_cid);
  return res.status(201).json(newComment);
  }catch(err){
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
router.post("/:id/like",requiresAuthentication, async (req, res) => {
    try {
      const { user_id } = req.body;
      const success = await likeComment(user_id, req.params.id);
      res.json({ liked: success });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

//unlike comment
router.delete("/:id/like",requiresAuthentication, async (req, res) => {
    try {
      const { user_id } = req.body;
      await unlikeComment(user_id, req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

//get likes number
router.get("/:id/likes", async (req, res) => {
    try {
        const comment_id = req.params.id;
        const likes = await getCommentLikes(comment_id);
        res.json({ likes });
    } catch (err) {
        res.status(500).json({ message: "fail to get likes number." });
    }
});


export default router;
