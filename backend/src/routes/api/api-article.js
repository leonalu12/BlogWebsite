
import express from "express";
import multer from "multer";
import path from "path";
import { getDatabase } from "../../data/database.js";
import {
  addArticle, updateArticle, deleteArticle, getAllArticles, getArticleById, likeArticle, unlikeArticle, getArticleLikes
} from "../../data/article-dao.js";

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
    const { search, filterBy, sortBy, order, userId, exactDate} = req.query;
    console.log("🛠 收到的请求参数:", { search, filterBy, sortBy, order, userId, exactDate }); // ✅ **调试**
    // const articles = await getAllArticles(search || "", filterBy || "title", sortBy || "date_time", order || "DESC", userId || null);
    const articles = await getAllArticles(search, filterBy, sortBy, order, userId, exactDate);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取单篇文章
router.get("/:id", async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加文章（支持文件上传）
router.post("/new", upload.single("image"), async (req, res) => {
  try {
    let { title, content, userId } = req.body;
    userId = Number(userId);

    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file); // This should not be undefined

    if (!title || !content || !userId) {
      return res.status(400).json({ error: "title, content and userId are required!" })
    }

    const imageUrl = req.file ? req.file.filename : null;

    const article = await addArticle({ title, content, userId, imageUrl });
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新文章
router.put("/:id/edit", upload.single("image"), async (req, res) => {
  try {
    let { title, content,userId } = req.body;
    console.log("Received data:", { title, content, userId });
    if (!title || !content || !userId)      {
      return res.status(400).json({ error: "title, content and userId are required!" })
    }

    const existingArticle = await getArticleById(req.params.id);
    if (!existingArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (existingArticle.user_id !== parseInt(userId)) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own articles" });
    }
 // ✅ 只在 `imgs` 表里存图片，不再传给 `articles`
 const imageUrl = req.file ? req.file.filename : null;


    // ✅ 调用 `updateArticle`，只更新 title 和 content
    const updatedArticle = await updateArticle(req.params.id, { title, content, ...(imageUrl && { imageUrl }) });

    res.status(200).json(updatedArticle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除文章
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from request

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch the article first
    const article = await getArticleById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    

    // Proceed with deletion
    const deleted = await deleteArticle(req.params.id);
    if (deleted) {
      res.status(204).send(); // No content response on success
    } else {
      res.status(500).json({ error: "Failed to delete article" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 点赞文章
router.post("/:id/like", async (req, res) => {
  try {
    console.log("收到的请求体:", req.body); // 打印请求体

    const { userId } = req.body;
    // 检查 userId 是否存在
    if (!userId) {
      return res.status(400).json({ error: "userId 未提供" });
    }

    const success = await likeArticle(userId, req.params.id);
    const likeCount = await getArticleLikes(req.params.id);
    res.json({
      liked: success,
      like_count: likeCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 取消点赞
router.delete("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    await unlikeArticle(userId, req.params.id);
    const likeCount = await getArticleLikes(req.params.id);

    res.json({
      liked: false,
      like_count: likeCount, // 返回最新点赞数
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/like/check", async (req, res) => {
  try {
    const { userId } = req.query;
    const db = await getDatabase();

    console.log(`收到点赞检查请求: userId=${userId}, articleId=${req.params.id}`);

    // 查询点赞数
    const likeCountResult = await db.get(
      "SELECT COUNT(*) AS like_count FROM like_a WHERE article_id = ?",
      [req.params.id]
    );
    console.log("点赞数查询结果:", likeCountResult);

    // 查询用户是否已点赞
    const userLiked = await db.get(
      "SELECT * FROM like_a WHERE user_id = ? AND article_id = ?",
      [userId, req.params.id]
    );
    console.log("用户点赞查询结果:", userLiked);

    res.json({
      like_count: likeCountResult ? likeCountResult.like_count : 0,
      isLiked: !!userLiked,
    });
  } catch (err) {
    console.error("点赞检查 API 出错:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;

