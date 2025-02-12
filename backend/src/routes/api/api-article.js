import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { getDatabase } from "../../data/database.js";
import {
  addArticle, updateArticle, deleteArticle, getAllArticles, getArticleById, likeArticle, unlikeArticle, getArticleLikes,deleteArticleImage
} from "../../data/article-dao.js";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";

const router = express.Router();



// Configure Multer to handle image uploads
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "public/images"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Get articles (support search, sorting, and filtering by user ID)
router.get("/", async (req, res) => {
  try {
    const { search, filterBy, sortBy, order, userId, exactDate } = req.query;
    console.log("🛠  Received request parameters:", { search, filterBy, sortBy, order, userId, exactDate });

    const articles = await getAllArticles(search, filterBy, sortBy, order, userId, exactDate);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get a single article (including comment count)
router.get("/:id", async (req, res) => {
  try {
    const db = await getDatabase();
    const articleId = req.params.id;
    

    // Get article information
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    console.log("🎨 Article Image URL:", article.image_url);

    //Get comment count
    const commentCountResult = await db.get(
      "SELECT COUNT(*) AS comment_count FROM comments WHERE article_id = ?",
      [articleId]
    );
    // Ensure the frontend retrieves the comment count
    article.comment_count = commentCountResult ? commentCountResult.comment_count : 0; 
    res.json(article);
  } catch (err) {
    console.error("❌  Failed to get article details:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Add an article (login required)
router.post("/new", requiresAuthentication, upload.single("image"), async (req, res) => {
  try {
    console.log("🛠️ Creating article. Received user:", req.user);
    
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user session" });
    }
    
    const { title, content } = req.body;
    //Get userId from session
    const userId = req.user.id; 
    console.log("✅ User ID:", userId);

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const imageUrl = req.file ? req.file.filename : null;
    const article = await addArticle({ title, content, userId, imageUrl });
    
    res.status(201).json(article);
  } catch (err) {
    console.error("❌ Error adding article:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Update article (login required)
router.put("/:id/edit", requiresAuthentication, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    // Get userId from authentication
    const userId = req.user.id; 
    console.log("🔄 Update Request:", { title, content, userId });

    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required!" });
    }

    const existingArticle = await getArticleById(req.params.id);
    if (!existingArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (existingArticle.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own articles" });
    }

    const imageUrl = req.file ? req.file.filename : null;

    const updatedArticle = await updateArticle(req.params.id, { title, content, ...(imageUrl && { imageUrl }) });

    res.status(200).json(updatedArticle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete article (login required)
router.delete("/:id", requiresAuthentication, async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log("🗑️ Delete Request: Article ID:", req.params.id, "User ID:", userId);

    // Get article information
    const article = await getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (article.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own articles" });
    }

    const deleted = await deleteArticle(req.params.id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: "Failed to delete article" });
    }
  } catch (err) {
    console.error("❌ Error deleting article:", err.message);
    res.status(500).json({ error: err.message });
  }
});



  // Like article (login required)
router.post("/:id/like", requiresAuthentication, async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log("👍 Like Request:", { userId, articleId: req.params.id });

    const success = await likeArticle(userId, req.params.id);
    const likeCount = await getArticleLikes(req.params.id);

    res.json({ liked: success, like_count: likeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//delete an image from the article:
router.delete("/:id/delete-image", async (req, res) => {
  try {
    console.log("🗑️ Received request to delete image for article ID:", req.params.id);

    const article = await getArticleById(req.params.id);
    if (!article || !article.image_url) {
      return res.status(404).json({ error: "No image found." });
    }







    const imagePath = path.join("public/images", path.basename(article.image_url));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("✅ Image deleted from storage:", imagePath);
    }

    await deleteArticleImage(req.params.id);

    res.status(200).json({ message: "Image deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Unlike (login required)
router.delete("/:id/like", requiresAuthentication, async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log("👎 Unlike Request:", { userId, articleId: req.params.id });

    await unlikeArticle(userId, req.params.id);
    const likeCount = await getArticleLikes(req.params.id);

    res.json({ liked: false, like_count: likeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Get article like status (whether liked)
router.get("/:id/like/check", requiresAuthentication, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Please log in" });
    }
    //Get current user ID
    const userId = req.user.id; 
    const articleId = req.params.id;
    const db = await getDatabase();

    console.log(`🔍 Check article ${articleId} whether by user ${userId} like`);

   
    // Check if the user has already liked
    const userLiked = await db.get(
      "SELECT * FROM like_a WHERE user_id = ? AND article_id = ?",
      [userId, articleId]
    );

    res.json({
      // `!!userLiked` ensures returning `true/false`
      isLiked: !!userLiked 
    });
  } catch (err) {
    console.error("❌ Error in like check API:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/likesAmount", async (req, res) => {
  try {
    const articleId = req.params.id;
    const db = await getDatabase();
    const likeCountResult = await db.get(
      "SELECT COUNT(*) AS like_count FROM like_a WHERE article_id = ?",
      [articleId]
    );
    res.json({ like_count: likeCountResult ? likeCountResult.like_count : 0 });
  
  } catch (err) {
    console.error("❌  Failed to get like count:", err.message);
    res.status(500).json({ error: err.message });
  }

});
router.stack.forEach((route) => {
  if (route.route) {
    console.log(`🛠 Registered Route: ${Object.keys(route.route.methods).join(", ").toUpperCase()} ${route.route.path}`);
  }
});
export default router;
