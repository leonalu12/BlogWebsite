import { getDatabase } from "./database.js";




/* get all comments from given article id */
export async function getCommentsWithArticleId(articleId) {
    const db = await getDatabase();
    const comments = await db.all("SELECT * FROM comments WHERE article_id = ?", [articleId]);
    return comments;
}

/* add comment */
export async function addComment(content, layer, date_time, user_id, article_id, parent_cid) {
    const db = await getDatabase();
    const dbResult = await db.run(
        "INSERT INTO comments (content, layer, date_time, user_id, article_id, parent_cid) VALUES(?, ?, ?, ?, ?, ?)",[content, layer, date_time, user_id, article_id, parent_cid]);
    const newComment = await db.get("SELECT * FROM comments WHERE id = ?" , [dbResult.lastID]);
    return newComment;
}

/* delete comment */
export async function deleteComment(id) {
    const db = await getDatabase();
    return await db.run("DELETE FROM comments WHERE id = ?",[id]);
}