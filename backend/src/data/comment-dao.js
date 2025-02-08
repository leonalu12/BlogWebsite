import { getDatabase } from "./database.js";

/* get all comments from given article id */
export async function getCommentsWithArticleId(articleId) {
    const db = await getDatabase();
    const comments = await db.all(`
        SELECT comments.*, users.username, users.icon
        FROM comments
        LEFT JOIN users ON comments.user_id = users.id
        WHERE article_id = ?`, [articleId]);
    return comments;
}

/* add comment */
export async function addComment(content, layer, date_time, user_id, article_id, parent_cid) {
    const db = await getDatabase();
    const dbResult = await db.run(
        "INSERT INTO comments (content, layer, date_time, user_id, article_id, parent_cid) VALUES(?, ?, ?, ?, ?, ?)",[content, layer, date_time, user_id, article_id, parent_cid]);
    const newComment = await db.get("SELECT * FROM comments WHERE id = ?" , [dbResult.lastID]);
    // 获取该评论的点赞数
    const likeCount = await getCommentLikes(newComment.id);
    // 将点赞数添加到评论对象
    newComment.likes = likeCount;
    return newComment;
}

/* delete comment */
export async function deleteComment(id) {
    const db = await getDatabase();
    return await db.run("DELETE FROM comments WHERE id = ?",[id]);
}

/* like */
export async function likeComment(user_id, comment_id) {
    const db = await getDatabase();
    // check like
    const existingLike = await db.get("SELECT * FROM like_c WHERE user_id = ? AND comment_id = ?", [user_id, comment_id]);
    if (!existingLike) {
      await db.run("INSERT INTO like_c (user_id, comment_id) VALUES (?, ?)", [user_id, comment_id]);
      return true;
    }
    return false;
}

/* unlike */
export async function unlikeComment(user_id, comment_id) {
    const db = await getDatabase();
    await db.run("DELETE FROM like_c WHERE user_id = ? AND comment_id = ?", [user_id, comment_id]);
}

/* get the number of likes from a comment */
export async function getCommentLikes(comment_id) {
    const db = await getDatabase();
    const result = await db.get("SELECT COUNT(*) AS like_count FROM like_c WHERE comment_id = ?", [comment_id]);
    return result ? result.like_count : 0;
}

/* get the layer from a comment */
export async function getLayer(comment_id) {
    const db = await getDatabase();
    const result = await db.get("SELECT layer FROM comments WHERE id = ?", [comment_id]);
    return result;
}