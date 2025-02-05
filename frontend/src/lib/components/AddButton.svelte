<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { derived } from "svelte/store";
  
    // Get the current URL path
    const currentPath = derived(page, ($page) => $page.url.pathname);
  
    function navigateToNewArticle() {
      goto("/articles/new");
    }
  </script>
  
  {#if $currentPath !== "/articles/new"} 
  <button class="add-article-btn" on:click={navigateToNewArticle}>
    +
  </button>
{/if}

  
  <style>
    .add-article-btn {
      width: 50px;
      height: 50px;
      background: #ff4081; 
      color: white;
      font-size: 32px;
      font-weight: bold;
      border: none;
      border-radius: 50%; /*a circle */
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.3s ease, transform 0.2s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  
    .add-article-btn:hover {
      background: #e91e63; /* Darker pink on hover */
      transform: scale(1.1); /* Slight pop effect */
    }
  
    .add-article-btn:active {
      transform: scale(1);
    }
  </style>
  