<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../../lib/components/utils/alertWindow.svelte";
  import DeleteConfirmWindow from "../../lib/components/utils/DeleteConfirmWindow.svelte";
  import { displayLogin } from "../../lib/store/userStore";
  import { logedIn } from "../../lib/store/userStore";
  import { iconName } from "../../lib/store/userStore";
  let user = writable(null);
  // Initially set to null
  let user_id = null;
  $: if ($user) {
    //// When user data updates, user_id will automatically update
    user_id = $user.id;
  }

  let articles = [];
  let showDeleteWindow = false;
  let showErrorWindow = false;
  let confirmMessage = "Are you sure you want to delete this article?";
  let errorWindowMessage = "";
  let articleToDelete = null;

  // Add sorting and filtering functionality
  let searchQuery = "";
  let filterBy = "title";
  let sortBy = "date_time";
  let order = "DESC";
  let exactDate = "";

  let searchWrapper;
  let minScale = 0.8;
  let navbarHeight = 80;
  let isFixed = false;

  onMount(() => {
    const handleScroll = () => {
      if (!searchWrapper) return;

      const scrollPosition = window.scrollY || document.documentElement.scrollTop;

      if (scrollPosition > navbarHeight) {
        isFixed = true;
        searchWrapper.style.transform = `scale(${minScale})`;
      } else {
        isFixed = false;
        const scale = Math.max(minScale, 1 - (scrollPosition / navbarHeight) * (1 - minScale));
        searchWrapper.style.transform = `scale(${scale})`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  /** Get user information */
  async function fetchUser() {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/users`, {
        method: "GET",
        credentials: "include"
      });
      if (res.ok) {
        const userData = await res.json();
        // Update store
        user.set(userData);
      } else {
        console.error("User is not logged in. Redirecting...");
        displayLogin.set(true);
      }
    } catch {
      errorWindowMessage = "Error fetching user.";
      showErrorWindow = true;
    }
  }

  /** Get articles by user ID */
  async function fetchMyArticles() {
    if (!user_id) return;

    const queryParams = new URLSearchParams({
      userId: user_id,
      search: searchQuery,
      filterBy,
      sortBy,
      order,
      ...(filterBy === "date_time" && exactDate ? { exactDate } : {})
    });

    let apiURL = `${PUBLIC_API_BASE_URL}/articles?${queryParams}`;

    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      articles = [...data];
    } catch {
      errorWindowMessage = "Error fetching articles.";
      showErrorWindow = true;
    }
  }

  function handleSearch() {
    if (filterBy === "date_time" && exactDate) {
      let formattedDate = new Date(exactDate).toISOString().split("T")[0];
      exactDate = formattedDate;
    }
    searchQuery = searchQuery.replace(/[""„‟❝❞＂]/g, '"').trim();
    fetchMyArticles();
  }

  function handleFilterChange(event) {
    filterBy = event.target.value;
    if (filterBy !== "date_time") {
      exactDate = "";
    }
    fetchMyArticles();
  }

  function handleSort(event) {
    sortBy = event.target.value;
    fetchMyArticles();
  }

  function toggleOrder() {
    order = order === "ASC" ? "DESC" : "ASC";
    fetchMyArticles();
  }

  /** Delete article */
  function confirmDeleteArticle(id) {
    articleToDelete = id;
    showDeleteWindow = true;
  }

  async function deleteArticle(id) {
    if (!articleToDelete) {
      return;
    }
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        // Pass userId here
        body: JSON.stringify({ userId: user_id })
      });

      if (response.ok) {
        articles = articles.filter((article) => article.id !== articleToDelete);
      } else {
        errorWindowMessage = "Failed to delete article.";
        showErrorWindow = true;
      }
    } catch {
      errorWindowMessage = "Error deleting article.";
      showErrorWindow = true;
    } finally {
      showDeleteWindow = false;
      articleToDelete = null;
    }
  }

  function cancelDelete() {
    showDeleteWindow = false;
    articleToDelete = null;
  }

  function handleErrorConfirm() {
    showErrorWindow = false;
  }

  // Fetch user information first, then get articles when the component loads
  onMount(async () => {
    await fetchUser();
    // Automatically fetch articles when user data is updated
    $user && fetchMyArticles();
  });

  onMount(async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/auth/check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      if (response.ok) {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/users/icon`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error(" Failed to retrieve user avatar");
        } else {
          const data = await response.json();
          iconName.set(data);
          console.log("get img successful:", data);
          logedIn.set(true);
        }
      }
    } catch (error) {
      console.error("Failed to retrieve user avatar:", error);
    }
  });
</script>

<svelte:head>
  <title>My Articles</title>
</svelte:head>

<div class="search-container" class:fixed={isFixed}>
  <div class="search-wrapper" bind:this={searchWrapper}>
    <div class="search-bar">
      <div class="sort-container">
        <select bind:value={sortBy} on:change={handleSort}>
          <option value="date_time">Date</option>
          <option value="title">Title</option>
        </select>

        <button on:click={toggleOrder} class="order-button">
          {order === "DESC" ? "⬇" : "⬆"}
        </button>
      </div>

      {#if filterBy === "date_time"}
        <span class="date-label">Select date:</span>
        <input type="date" bind:value={exactDate} on:change={handleSearch} />
      {:else}
        <input 
          type="text" 
          bind:value={searchQuery} 
          placeholder="Search..." 
          style="background: transparent; border: none; outline: none; font-size: 18px;"
        />
      {/if}

      <select bind:value={filterBy} on:change={handleFilterChange}>
        <option value="title">Title</option>
        <option value="date_time">Date</option>
      </select>

      <button on:click={handleSearch}>Search</button>
    </div>
  </div>
</div>

{#if articles.length > 0}
  <div class="articles">
    {#each articles as article}
      {#if !article.image_url}
        <div class="article">
          <a href={`/articles/${article.id}`}>
            <div class="article-content">
              <h2>{article.title}</h2>
              <div class="article-meta">
                <div>Published on: {article.date_time}</div>
              </div>
              <div class="articleWithoutImg">{@html article.content}</div>
            </div>
          </a>
          <div class="button-container">
            <button class="delete-button" on:click={() => confirmDeleteArticle(article.id)}>
              Delete
            </button>
          </div>
        </div>
      {:else}
        <div class="article">
          <a href={`/articles/${article.id}`}>
            <div class="article-content">
              <img src="{PUBLIC_IMAGES_URL}/{article.image_url}" alt={article.title} />
              <h2>{article.title}</h2>
              <div class="article-meta">
                <div>Published on: {article.date_time}</div>
              </div>
              <div class="article-preview">{@html article.content}</div>
            </div>
          </a>
          <div class="button-container">
            <button class="delete-button" on:click={() => confirmDeleteArticle(article.id)}>
              Delete
            </button>
          </div>
        </div>
      {/if}
    {/each}
  </div>
{:else if $logedIn}
  <p class="no-articles">No articles found.</p>
{:else}
  <p class="no-articles">Please log in to view your articles.</p>
{/if}

{#if showDeleteWindow}
  <DeleteConfirmWindow
    message={confirmMessage}
    on:confirm={deleteArticle}
    on:cancel={cancelDelete}
  />
{/if}

{#if showErrorWindow}
  <AlertWindow message={errorWindowMessage} on:confirm={handleErrorConfirm} />
{/if}

<style>
  .search-container {
    padding: 10px 0;
    transition: all 0.3s ease;
    z-index: 31;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    display: block;
  }

  .search-container.fixed {
    position: fixed;
    top: 0;
  }

  .search-wrapper {
    margin: 0 auto;
    transition: transform 0.3s ease;
    transform-origin: top center;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: rgba(255, 245, 245);
    border-radius: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    height: 50px;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }

  .sort-container {
    display: flex;
    align-items: center;
    gap: 10px;
    border-right: #acacac 1px solid;
    padding-right: 10px;
    height: 90%;
  }

  .search-bar input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 18px;
  }

  .search-bar select {
    border: none;
    outline: none;
    background: transparent;
    padding: 5px;
    font-size: 18px;
    color: #666;
  }

  .search-bar button {
    background: linear-gradient(90deg, pink, #ffe4e1);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: transform 0.2s ease;
    width: 70px;
    height: 35px;
    font-size: 13px;
  }

  .search-bar button:hover {
    transform: scale(1.05);
  }

  .order-button {
    background: linear-gradient(90deg, pink, #ffe4e1);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: transform 0.2s ease;
    width: 70px;
    height: 30px;
  }

  .date-label {
    color: #666;
    font-size: 14px;
    white-space: nowrap;
    margin-right: 10px;
  }

  .no-articles {
    text-align: center;
    margin-top: 50px;
    color: #666;
    font-size: 1.2em;
  }

  .articleWithoutImg {
    display: -webkit-box;
    -webkit-line-clamp: 15;
    line-clamp: 10;
    -webkit-box-orient: vertical;
    overflow: hidden;
    padding: 0 15px;
    margin-bottom: 10px;
  }

  .articles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
    margin-top: 100px;
  }

  .article {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column; /* 使内容垂直排列 */
  }

  .article:hover {
    transform: translateY(-5px) scale(1.02) rotate(0.5deg);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    z-index: 0;
  }

  .article img {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .article-content {
    padding: 15px;
    flex: 1; /* Make the content area occupy the remaining space */
  }

  .article h2 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 15px;
    margin-bottom: 10px;
  }

  .article-meta {
    margin-left: 15px;
    margin-right: 15px;
    color: #666;
    font-size: 0.9em;
  }

  .article-preview {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    padding: 0 15px;
    z-index: 0;
  }

  .button-container {
    padding: 15px;
    padding-top: 0;
    text-align: right; /* Align the button to the right */
    margin-top: auto; /* Push the button to the bottom of the container */
  }

  .delete-button {
    background: linear-gradient(90deg, pink, #ffe4e1);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .delete-button:hover {
    transform: scale(1.05);
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  @media (max-width: 1080px) {
    .articles {
      margin-top: 150px;
    }
    .search-bar {
       padding: 10px 10px;
       flex-direction: column;
       gap: 10px;
       height: auto;
       padding: 15px;
       align-items: center;
     }
     .sort-container {
       width: 100%;
       justify-content: center;
       border-right: none;
       padding-right: 0;
     }
     .right-search-container {
       width: 100%;
       justify-content: center;
       flex-direction: column;
       gap: 10px;
     }
    .search-container{
      z-index: 29;
      width: 80%;
    }
    .search-container.fixed {
      position: absolute;
      top: 0;
    }
  }
</style>
