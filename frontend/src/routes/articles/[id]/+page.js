import { PUBLIC_API_BASE_URL } from "$env/static/public";


export async function load({ params, fetch }) {
  const ARTICLE_URL = `${PUBLIC_API_BASE_URL}/articles/${params.id}`;
  const response = await fetch(ARTICLE_URL, { credentials: "include" });
  const article = await response.json();
  console.log(article);
  return { article };
}