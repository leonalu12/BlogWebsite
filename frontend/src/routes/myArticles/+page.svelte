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
  let user_id = null; // 初始设为空
  $: if ($user) {
    user_id = $user.id; // 当 user 数据更新时，user_id 也会自动更新
  }

  let articles = [];
  let showDeleteWindow = false;
  let showErrorWindow = false;
  let confirmMessage = "Are you sure you want to delete this article?";
  let errorWindowMessage = "";
  let articleToDelete = null;

  /** 获取用户信息 */
  async function fetchUser() {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/users`, {
        method: "GET",
        credentials: "include"
      });
      if (res.ok) {
        const userData = await res.json();
        user.set(userData); // 更新 store
      } else {
        console.error("User is not logged in. Redirecting...");
        displayLogin.set(true);
      }
    } catch {
      errorWindowMessage = "Error fetching user.";
      showErrorWindow = true;
    }
  }

  /** 根据用户 ID 获取文章 */
  async function fetchMyArticles() {
    if (!user_id) return; // 确保 user_id 存在再请求数据
    let apiURL = `${PUBLIC_API_BASE_URL}/articles?userId=${user_id}`;
    console.log("Requesting:", apiURL);

    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched articles:", data);
      articles = [...data]; // 触发 Svelte 反应性更新
    } catch {
      errorWindowMessage = "Error fetching articles.";
      showErrorWindow = true;
    }
  }

  /** 删除文章 */
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

        body: JSON.stringify({ userId: user_id }) // 这里传递 userId
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

  function cancelDelete(){
    showDeleteWindow = false;
    articleToDelete = null;
  }

  function handleErrorConfirm(){
    showErrorWindow = false;
  }

  // 组件加载时先获取用户信息，再获取文章
  onMount(async () => {
    await fetchUser();
    $user && fetchMyArticles(); // 当 user 数据更新后自动获取文章
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
      if (response.ok){
        const response = await fetch(`${PUBLIC_API_BASE_URL}/users/icon`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error("获取用户头像失败");
        } else {
          const data = await response.json();
          iconName.set(data);
          console.log("get img successful:", data);
          logedIn.set(true);
        }
      }
    } catch (error) {
      console.error("获取用户头像失败:", error);
    } 
  });
</script>

<svelte:head>
  <title>My Articles</title>
</svelte:head>

{#if articles.length > 0}
<div class="articles">
  {#each articles as article}
    <div class="article">
      <a href={`/articles/${article.id}`}>
        <div class="article-content">
          {#if article.image_url}
            <img src="{PUBLIC_IMAGES_URL}/{article.image_url}" alt={article.title} />
          {:else}
            <div class="no-image">No Image</div>
          {/if}
          <h2 class="article-title">{article.title}</h2>
          <div class="article-meta">
            <span>Published on: {article.date_time}</span>
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
  {/each}
</div>
{:else if $logedIn}
  <p>No articles found.</p>
{:else}
  <p>Please log in to view your articles.</p>
{/if}

{#if showDeleteWindow}
  <DeleteConfirmWindow message = {confirmMessage} on:confirm = {deleteArticle} on:cancel = {cancelDelete} />
{/if}

{#if showErrorWindow}
  <AlertWindow message={errorWindowMessage} on:confirm={handleErrorConfirm} />
{/if}



<style>
  .articles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
    margin-top: 95px;
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
    box-shadow: 0 8px 15px rgba(0,0,0,0.2);
    z-index: 30;
  }

  .article img {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .article-content {
    padding: 15px;
    flex: 1; /* 让内容区域占据剩余空间 */
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
  }

  .button-container {
    padding: 15px;
    padding-top: 0;
    text-align: right; /* 按钮靠右 */
    margin-top: auto; /* 将按钮推到容器底部 */
  }

  .delete-button {
    background: linear-gradient(90deg, pink, #FFE4E1);
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

  @media (max-width: 768px) {
    .articles {
      padding: 10px;
    }
  }
</style>