import express from "express";
import multer from "multer";
import path from "path";
import { getDatabase } from "../../data/database.js";
import {
  addArticle, updateArticle, deleteArticle, getAllArticles, getArticleById, likeArticle, unlikeArticle, getArticleLikes
} from "../../data/article-dao.js";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";

const router = express.Router();

// 配置 Multer 处理图片上传
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "public/images"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 获取文章（支持搜索、排序、按用户ID获取）
router.get("/", async (req, res) => {
  try {
    const { search, filterBy, sortBy, order, userId, exactDate } = req.query;
    console.log("🛠 收到的请求参数:", { search, filterBy, sortBy, order, userId, exactDate });

    const articles = await getAllArticles(search, filterBy, sortBy, order, userId, exactDate);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 获取单篇文章（包含评论数量）
router.get("/:id", async (req, res) => {
  try {
    const db = await getDatabase();
    const articleId = req.params.id;
    

    // 获取文章信息
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });

    console.log("🎨 Article Image URL:", article.image_url);

    // 获取评论数量
    const commentCountResult = await db.get(
      "SELECT COUNT(*) AS comment_count FROM comments WHERE article_id = ?",
      [articleId]
    );

    article.comment_count = commentCountResult ? commentCountResult.comment_count : 0; // ✅ 确保前端获取评论数
    res.json(article);
  } catch (err) {
    console.error("❌ 获取文章详情失败:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// 添加文章（需要登录）
router.post("/new", requiresAuthentication, upload.single("image"), async (req, res) => {
  try {
    console.log("🛠️ Creating article. Received user:", req.user);
    
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user session" });
    }
    
    const { title, content } = req.body;
    const userId = req.user.id; // 🛠 **从 session 获取 userId**
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


// 更新文章（需要登录）
router.put("/:id/edit", requiresAuthentication, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id; // 🛠 **从认证中获取 userId**
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

// 删除文章（需要登录）
router.delete("/:id", requiresAuthentication, async (req, res) => {
  try {
    const userId = req.user.id; // 🛠 **从 session 获取 userId**
    console.log("🗑️ Delete Request: Article ID:", req.params.id, "User ID:", userId);

    // 获取文章信息
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

// 点赞文章（需要登录）
router.post("/:id/like", requiresAuthentication, async (req, res) => {
  try {
    const userId = req.user.id; // 🛠 **获取用户 ID**
    console.log("👍 Like Request:", { userId, articleId: req.params.id });

    const success = await likeArticle(userId, req.params.id);
    const likeCount = await getArticleLikes(req.params.id);

    res.json({ liked: success, like_count: likeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 取消点赞（需要登录）
router.delete("/:id/like", requiresAuthentication, async (req, res) => {
  try {
    const userId = req.user.id; // 🛠 **获取用户 ID**
    console.log("👎 Unlike Request:", { userId, articleId: req.params.id });

    await unlikeArticle(userId, req.params.id);
    const likeCount = await getArticleLikes(req.params.id);

    res.json({ liked: false, like_count: likeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取文章点赞状态（是否已点赞 ）
router.get("/:id/like/check", requiresAuthentication, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Please log in" });
    }

    const userId = req.user.id; // ✅ 获取当前用户 ID
    const articleId = req.params.id;
    const db = await getDatabase();

    console.log(`🔍 检查文章 ${articleId} 是否被用户 ${userId} 点赞`);

   

    // 检查用户是否已点赞
    const userLiked = await db.get(
      "SELECT * FROM like_a WHERE user_id = ? AND article_id = ?",
      [userId, articleId]
    );

    res.json({
      isLiked: !!userLiked // `!!userLiked` 确保返回 `true/false`
    });
  } catch (err) {
    console.error("❌ 点赞检查 API 出错:", err.message);
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
    console.error("❌ 获取点赞数失败:", err.message);
    res.status(500).json({ error: err.message });
  }

});

export default router;
