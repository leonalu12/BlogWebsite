

import { getDatabase } from "./database.js";
import { updateDatabase } from "./util.js";

/**
 * Get all articles(search&sort)
 * @param {string} search 
 * @param {string} filterBy  (defult: title)
 * @param {string} sortBy  (defult: date_time)
 * @param {string} order  (defult: DESC)
 * @param {number} userId 
 * @returns {Array} 
 */
export async function getAllArticles(search = "", filterBy = "title", sortBy = "date_time", order = "DESC", userId = null) {
  const db = await getDatabase();
    // check `search` whether have""（Precise search）
const isExactSearch = search.startsWith('"') && search.endsWith('"');
// delete the ""，If the search is precise, it will be matched directly; otherwise, the fuzzy search will be performed
const cleanSearch = isExactSearch ? search.slice(1, -1) : `%${search}%`;

let query = `
SELECT a.id, a.title, a.content, a.date_time, u.username, u.icon,
       (SELECT COUNT(*) FROM like_a WHERE article_id = a.id) AS like_count,
       (SELECT path FROM imgs WHERE article_id = a.id LIMIT 1) AS image_url
FROM articles a
JOIN users u ON a.user_id = u.id
WHERE ${filterBy === "content" ? "a.content" : "a.title"} ${isExactSearch ? "=" : "LIKE"} ?
`;

let params = [cleanSearch];  // 

  // 按用户ID筛选
  if (userId) {
    query += " AND a.user_id = ?";
    params.push(userId);
  }

  query += ` ORDER BY ${sortBy === "username" ? "u.username" : "a." + sortBy} ${order};`;

  return await db.all(query, params);
}

/**
 * 获取单篇文章
 * @param {number} id 文章ID
 * @returns {Object} 文章数据
 */
export async function getArticleById(id) {
  const db = await getDatabase();
  return await db.get(`
    SELECT a.id, a.title, a.content, a.date_time, u.username, u.icon,
           (SELECT COUNT(*) FROM like_a WHERE article_id = a.id) AS like_count,
           (SELECT path FROM imgs WHERE article_id = a.id LIMIT 1) AS image_url
    FROM articles a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `, [id]);
}

/**
 * 添加文章
 * @param {Object} articleData 文章数据
 * @returns {Object} 新文章数据
 */
export async function addArticle({ title, content, userId, imageUrl }) {
  const db = await getDatabase();

    const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  // 插入文章
  const query = `INSERT INTO articles (title, content, date_time, user_id) VALUES (?, ?, ?, ?)`;
  const result = await db.run(query, [title, content, formattedDate, userId]);



  // 插入图片（如果有）
  if (imageUrl) {
    await db.run(`INSERT INTO imgs (path, article_id) VALUES (?, ?)`, [imageUrl, result.lastID]);
  }

  return { id: result.lastID, title, content, userId, imageUrl };
}

/**
 * 更新文章
 * @param {number} id 文章ID
 * @param {Object} updateData 更新数据
 * @returns {Object|null} 更新后的文章
 */
export async function updateArticle(id, updateData) {
  const db = await getDatabase();

  if (updateData.imageUrl === undefined) {
    delete updateData.imageUrl;
  }

  // 更新文章
  const result = await updateDatabase(db, "articles", updateData, id);

  // 如果有新图片，更新 img 表
  if (updateData.imageUrl) {
    await db.run(`UPDATE imgs SET path = ? WHERE article_id = ?`, [updateData.imageUrl, id]);
  }

  return result.changes > 0 ? { id, ...updateData } : null;
}

/**
 * 删除文章
 * @param {number} id 文章ID
 * @returns {boolean} 是否删除成功
 */
export async function deleteArticle(id) {
  const db = await getDatabase();
  const result = await db.run("DELETE FROM articles WHERE id = ?", [id]);
  return result.changes > 0;
}

/**
 * 点赞文章
 * @param {number} userId 用户ID
 * @param {number} articleId 文章ID
 * @returns {boolean} 是否点赞成功
 */
export async function likeArticle(userId, articleId) {
  const db = await getDatabase();

  // 检查是否已经点赞
  const existingLike = await db.get("SELECT * FROM like_a WHERE user_id = ? AND article_id = ?", [userId, articleId]);
  
  if (!existingLike) {
    await db.run("INSERT INTO like_a (user_id, article_id) VALUES (?, ?)", [userId, articleId]);
    return true;
  }
  
  return false;
}

/**
 * 取消点赞
 * @param {number} userId 用户ID
 * @param {number} articleId 文章ID
 */
export async function unlikeArticle(userId, articleId) {
  const db = await getDatabase();
  await db.run("DELETE FROM like_a WHERE user_id = ? AND article_id = ?", [userId, articleId]);
}

/**
 * 获取文章的点赞数
 * @param {number} articleId 文章ID
 * @returns {number} 点赞数
 */
export async function getArticleLikes(articleId) {
  const db = await getDatabase();
  const result = await db.get("SELECT COUNT(*) AS like_count FROM like_a WHERE article_id = ?", [articleId]);
  return result ? result.like_count : 0;
}

