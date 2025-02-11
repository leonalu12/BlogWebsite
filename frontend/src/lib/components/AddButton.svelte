<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { derived } from "svelte/store";

  const currentPath = derived(page, ($page) => $page.url.pathname);

  function navigateToNewArticle() {
    goto("/articles/new"); 
  }
</script>

{#if $currentPath !== "/articles/new"}
  <button class="add-article-btn" on:click={navigateToNewArticle}>
    Write New Article
  </button>
{/if}

<style>
  .add-article-btn {
    width: 200px;
    padding: 12px 30px;
    background: linear-gradient(90deg, pink, #FFE4E1);
    color: #333;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    text-align: center;
  }

  .add-article-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.15);
  }
</style>