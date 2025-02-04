import { PUBLIC_API_BASE_URL } from "$env/static/public";

const ARTICLES_URL = `${PUBLIC_API_BASE_URL}/articles`;

/**
 * TODO Load your own data in the homepage here.
 *
 * You may need other *.js files with other load functions too.
 */
export async function load({ fetch }) {
  const response = await fetch(ARTICLES_URL, { credentials: "include" });
  const articles = await response.json();
  return { articles };
}
