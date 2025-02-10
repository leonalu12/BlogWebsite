import { PUBLIC_API_BASE_URL } from "$env/static/public";

export async function load({ params, fetch }) {
  const ARTICLE_URL = `${PUBLIC_API_BASE_URL}/articles/${params.id}`;
  const LIKE_CHECK_URL = `${PUBLIC_API_BASE_URL}/articles/${params.id}/like/check`;

  try {
    const [articleResponse, likeResponse] = await Promise.all([
      fetch(ARTICLE_URL, { credentials: "include" }),
      fetch(LIKE_CHECK_URL, { credentials: "include" })
    ]);

    if (!articleResponse.ok || !likeResponse.ok) {
      throw new Error("加载文章或点赞状态失败");
    }

    const article = await articleResponse.json();
    const likeData = await likeResponse.json();

    return {
      article: {
        ...article,
        like_count: likeData.like_count, // ✅ 确保点赞数正确
        isLiked: likeData.isLiked, // ✅ 确保用户点赞状态正确
        comment_count: article.comment_count ?? 0, // ✅ 确保前端有评论数量
      },
    };
  } catch (err) {
    console.error("❌ 加载文章或点赞状态失败:", err);
    return { article: null };
  }
}
