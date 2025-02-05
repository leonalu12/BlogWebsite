import { PUBLIC_API_BASE_URL } from "$env/static/public";

export async function load({ params, fetch }) {
  const ARTICLE_URL = `${PUBLIC_API_BASE_URL}/articles/${params.id}`;
  const LIKE_CHECK_URL = `${PUBLIC_API_BASE_URL}/articles/${params.id}/like/check?userId=2`; // 假设用户 ID 为 2

  try {
    // 同时请求文章数据和点赞状态
    const [articleResponse, likeResponse] = await Promise.all([
      fetch(ARTICLE_URL),
      fetch(LIKE_CHECK_URL),
    ]);

    if (!articleResponse.ok || !likeResponse.ok) {
      throw new Error("加载文章或点赞状态失败");
    }

    const article = await articleResponse.json();
    const likeData = await likeResponse.json();

    return {
      article: {
        ...article,
        like_count: likeData.like_count, // 合并点赞数
        isLiked: likeData.isLiked, // 合并点赞状态
      },
    };
  } catch (err) {
    console.error("❌ 加载文章或点赞状态失败:", err);
    return { article: null }; // 返回空数据防止页面崩溃
  }
}
