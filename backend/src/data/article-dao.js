

import { getDatabase } from "./database.js";
import { updateDatabase } from "./util.js";
import fs from "fs";
import path from "path";
const PUBLIC_IMAGES_URL = process.env.PUBLIC_IMAGES_URL || "http://localhost:3000/images";
const PUBLIC_IMAGES_PATH = path.join(process.cwd(), "public/images");
/**
 * GET All Articles(search&sort)
 * @param {string} search 
 * @param {string} filterBy  (defult: title)
 * @param {string} sortBy  (defult: date_time)
 * @param {string} order  (defult: DESC)
 * @param {number} userId 
 * @returns {Array} 
 */
export async function getAllArticles(
  search = "",
  filterBy = "title",
  sortBy = "date_time",
  order = "DESC",
  userId = null,
  exactDate = null
) {
  const db = await getDatabase();

  let query = `
    SELECT a.id, a.title, a.content, a.date_time, u.username, u.icon,
           (SELECT COUNT(*) FROM like_a WHERE article_id = a.id) AS like_count,
           (SELECT path FROM imgs WHERE article_id = a.id LIMIT 1) AS image_url
    FROM articles a
    JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;

  let params = [];

  // Handle precise search (remove Unicode quotes & spaces)
  search = search.replace(/[“”„‟❝❞＂]/g, '"').trim();

  if (search.startsWith('"') && search.endsWith('"')) {
    // Remove quotes and trim spaces
    search = search.slice(1, -1).trim();

    if (filterBy === "title") {
      // Precisely match whole words
      query += ` AND LOWER(' ' || a.title || ' ') LIKE LOWER(?)`;
      // Ensure the search matches whole words
      params.push(`% ${search} %`);
    } else if (filterBy === "username") {
      // Let SQLite replace _ with and ensure whole word matching
      query += ` AND LOWER(' ' || REPLACE(u.username, '_', ' ') || ' ') LIKE LOWER(?)`;
      params.push(`% ${search} %`);
    }
  }
  // Handle fuzzy search (still replace _ with )
  else if (filterBy === "username") {
    query += ` AND LOWER(REPLACE(u.username, '_', ' ')) LIKE LOWER(?)`;
    params.push(`%${search}%`);
  }
  else {
    query += ` AND LOWER(a.title) LIKE LOWER(?)`;
    params.push(`%${search}%`);
  }


  if (filterBy === "date_time" && exactDate && exactDate !== "null") {
    console.log("📌 Filtering dates:", exactDate);
    query += " AND strftime('%Y-%m-%d', a.date_time) = ?";
    params.push(exactDate);
  }

  // Filter by user ID
  if (userId) {
    query += " AND a.user_id = ?";
    params.push(userId);
  }

  query += ` ORDER BY ${sortBy === "username" ? "u.username" : `a.${sortBy}`} ${order};`;

  console.log("🔍 Generated SQL Query:", query);
  console.log("📝 Query Params:", params);

  return await db.all(query, params);
}



/**
 * GET A Single Article
 * @param {number} id articleID
 * @returns {Object} articleData
 */
export async function getArticleById(id) {
  const db = await getDatabase();
  let article = await db.get(`
    SELECT a.id, a.title, a.content, a.date_time, user_id, u.username, u.icon,
           (SELECT COUNT(*) FROM like_a WHERE article_id = a.id) AS like_count,
           (SELECT path FROM imgs WHERE article_id = a.id LIMIT 1) AS image_path
    FROM articles a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `, [id]);

  if (article) {
    article.image_url = article.image_path ? `${PUBLIC_IMAGES_URL}/${article.image_path}` : null;
  }

  return article;
}



/**
 *  ADD New Article
 * @param {Object} articleData 
 * @returns {Object} New articleData 
 */
export async function addArticle({ title, content, userId, imageUrl }) {
  const db = await getDatabase();

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  // Insert an article
  const query = `INSERT INTO articles (title, content, date_time, user_id) VALUES (?, ?, ?, ?)`;
  const result = await db.run(query, [title, content, formattedDate, userId]);



  // Insert image (if available)
  if (imageUrl) {
    await db.run(`INSERT INTO imgs (path, article_id) VALUES (?, ?)`, [imageUrl, result.lastID]);
  }

  return { id: result.lastID, title, content, userId, imageUrl };
}

/**
 * EDIT Article
 * @param {number} id articleID
 * @param {Object} updateData 
 * @returns {Object|null}  Updated article
 */
export async function updateArticle(id, updateData) {
  const db = await getDatabase();
  const { title, content } = updateData;
  await db.run(`UPDATE articles SET title = ?, content = ? WHERE id = ?`, [title, content, id]);

  if (updateData.imageUrl !== undefined) {
    if (updateData.imageUrl) {
        // First check if an image already exists
        const existingImg = await db.get(`SELECT path FROM imgs WHERE article_id = ?`, [id]);
        if (existingImg) {
            await db.run(`UPDATE imgs SET path = ? WHERE article_id = ?`, [updateData.imageUrl, id]);
        } else {
            await db.run(`INSERT INTO imgs (article_id, path) VALUES (?, ?)`, [id, updateData.imageUrl]);
        }
    } else {
        await db.run(`DELETE FROM imgs WHERE article_id = ?`, [id]);
    }
}

  return { id, title, content, imageUrl: updateData.imageUrl };


}

/**
 * DELETE Article
 * @param {number} id ArticleID
 * @returns {boolean} Check if deletion was successful
 */
export async function deleteArticle(id) {
  const db = await getDatabase();
  const result = await db.run("DELETE FROM articles WHERE id = ?", [id]);
  return result.changes > 0;
}

/**
 * LIKE Article
 * @param {number} userId 
 * @param {number} articleId 
 * @returns {boolean}  Check if the like was successful
 */
export async function likeArticle(userId, articleId) {
  const db = await getDatabase();

  // Check if the like was successful
  const existingLike = await db.get("SELECT * FROM like_a WHERE user_id = ? AND article_id = ?", [userId, articleId]);

  if (!existingLike) {
    await db.run("INSERT INTO like_a (user_id, article_id) VALUES (?, ?)", [userId, articleId]);
    return true;
  }

  return false;
}

/**
 * UNLIKE Article
 * @param {number} userId 
 * @param {number} articleId 
 */
export async function unlikeArticle(userId, articleId) {
  const db = await getDatabase();
  await db.run("DELETE FROM like_a WHERE user_id = ? AND article_id = ?", [userId, articleId]);
}

/**
 * Get the like count of the article
 * @param {number} articleId 
 * @returns {number} Like count
 */
export async function getArticleLikes(articleId) {
  const db = await getDatabase();
  const result = await db.get("SELECT COUNT(*) AS like_count FROM like_a WHERE article_id = ?", [articleId]);
  return result ? result.like_count : 0;
}


export async function deleteArticleImage(articleId) {
  const db = await getDatabase();
  await db.run("DELETE FROM imgs WHERE article_id = ?", [articleId]);
}


