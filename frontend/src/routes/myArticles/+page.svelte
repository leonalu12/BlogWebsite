<script>
  import { onMount } from "svelte";
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  // export let data;
  let user_id = 2;
  let articles = [];

  /** Fetch articles by user ID */
  async function fetchMyArticles() {
    let apiURL = `${PUBLIC_API_BASE_URL}/articles?userId=${user_id}`; // Correct API URL
    console.log("Requesting:", apiURL); // Debugging

    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched articles:", data); // Debugging
      articles = [...data]; // Spread syntax ensures reactivity
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  }

  /** Delete an article */
  async function deleteArticle(id) {
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: user_id })
      });

      if (response.ok) {
        articles = articles.filter((article) => article.id !== id); // Update UI
      } else {
        console.error("Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  }

  onMount(fetchMyArticles);
</script>

<svelte:head>
  <title>My Articles</title>
</svelte:head>

<h1>My Articles</h1>

{#if articles.length > 0}
  <p>Found {articles.length} articles.</p>
  <!-- Debugging message -->
  <div class="articles">
    {#each articles as article}
      <div class="article">
        <p>Article ID: {article.id}</p>
        <!-- Debugging: Show article ID -->
        <a href={`/articles/${article.id}`}>
          <div>
            <div>
              {#if article.image_url}
                <img src="{PUBLIC_IMAGES_URL}/{article.image_url}" alt={article.title} />
              {:else}
                <p>No Image</p>
              {/if}
            </div>
            <div>{article.title}</div>
            <div>{article.content}</div>
          </div>
        </a>
        <button class="delete-button" on:click={() => deleteArticle(article.id)}>Delete</button>
      </div>
    {/each}
  </div>
{:else}
  <p>⚠️ No articles found.</p>
{/if}

<style>
  .articles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
    justify-content: center;
  }

  .article {
    height: auto;
    width: 100%;
    max-width: 350px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background: white;
    transition: transform 0.3s ease-in-out;
    position: relative;
  }

  .article:hover {
    transform: translateY(-5px);
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-bottom: 1px solid #ddd;
  }

  .article div {
    padding: 10px;
    font-size: 14px;
    line-height: 1.4;
  }

  .delete-button {
    background: red;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 14px;
    position: absolute;
    top: 10px;
    right: 10px;
    border-radius: 5px;
  }

  .delete-button:hover {
    background: darkred;
  }
</style>
