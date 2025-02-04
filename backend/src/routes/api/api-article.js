import express from "express";
import multer from "multer";
import path from "path";
import { 
  addArticle, updateArticle, deleteArticle, getAllArticles, getArticleById, likeArticle, unlikeArticle 
} from "../../data/article-dao.js";

const router = express.Router();

// 配置 Multer 处理图片上传
const storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 获取文章（支持搜索、排序、按用户ID获取）
router.get("/", async (req, res) => {
  try {
    const { search, filterBy, sortBy, order, userId } = req.query;
    const articles = await getAllArticles(search || "", filterBy || "title", sortBy || "date_time", order || "DESC", userId || null);
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
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const imageUrl = req.file ? `/images/${req.file.filename}` : null;

    const article = await addArticle({ title, content, userId, imageUrl });
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新文章
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageUrl = req.file ? `/images/${req.file.filename}` : undefined;

    const updatedArticle = await updateArticle(req.params.id, { title, content, imageUrl });
    res.json(updatedArticle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除文章
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteArticle(req.params.id);
    res.status(deleted ? 204 : 404).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 点赞文章
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const success = await likeArticle(userId, req.params.id);
    res.json({ liked: success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 取消点赞
router.delete("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    await unlikeArticle(userId, req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;