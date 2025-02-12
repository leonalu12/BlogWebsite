import { PUBLIC_API_BASE_URL } from "$env/static/public";

export async function load({ params, fetch }) {
  const ARTICLE_URL = `${PUBLIC_API_BASE_URL}/articles/${params.id}`;
  const LIKE_AMOUNT_URL = `${PUBLIC_API_BASE_URL}/articles/${params.id}/likesAmount`;

  try {
    const [articleResponse, likeResponse] = await Promise.all([
      fetch(ARTICLE_URL, { credentials: "include" }),
      fetch(LIKE_AMOUNT_URL, { credentials: "include" })
    ]);

    if (!articleResponse.ok || !likeResponse.ok) {
      throw new Error("Failed to load article or like status");
    }

    const article = await articleResponse.json();
    const likeData = await likeResponse.json();

    return {
      article: {
        ...article,
        // Ensure the like count is correct
        like_count: likeData.like_count, 
        //Ensure the frontend has the comment count
        comment_count: article.comment_count ?? 0, 
      },
    };
  } catch (err) {
    console.error("❌ Failed to load article or like status:", err);
    return { article: null };
  }
}
