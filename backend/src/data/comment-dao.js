import { getDatabase } from "./database.js";




/* get all comments from given article id */
export async function getCommentsWithArticleId(articleId) {
    const db = await getDatabase();
    const comments = await db.all("SELECT * FROM comments");
    return comments.find((c) => c.article_id == articleId);
}

/* add comment */
export async function addComment(content, layer, date_time, user_id, article_id, parent_cid) {
    const db = await getDatabase();
    const dbResult = await db.run(
        "INSERT INTO comments (content, layer, date_time, user_id, article_id, parent_cid) VALUES(content, layer, date_time, user_id, article_id, parent_cid)");
}

/* delete comment */
export async function deleteComment(id) {
    const db = await getDatabase();
    return await db.run("DELETE FROM comments WHERE id = id");
}