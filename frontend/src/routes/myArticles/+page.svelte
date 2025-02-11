<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../../lib/components/utils/alertWindow.svelte";
  import { displayLogin } from "../../lib/store/userStore";
  import { logedIn } from "../../lib/store/userStore";
  import UserLogin from "../../lib/components/userComponents/UserLogin.svelte";
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
  function handleErrorConfirm() {
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
  <p>Found {articles.length} articles.</p>
  <div class="articles">
    {#each articles as article}
      <div class="article">
        <p>Article ID: {article.id}</p>
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
            <div>{@html article.content}</div>
          </div>
        </a>
        <button class="delete-button" on:click={() => confirmDeleteArticle(article.id)}
          >Delete</button
        >
      </div>
    {/each}
  </div>
{:else if $logedIn}
  <p>No articles found.</p>
{:else}
  <p>Please log in to view your articles.</p>
{/if}

{#if showDeleteWindow}
  <AlertWindow message={confirmMessage} on:confirm={deleteArticle} />
{/if}

{#if showErrorWindow}
  <AlertWindow message={errorWindowMessage} on:confirm={handleErrorConfirm} />
{/if}

{#if $displayLogin}
  <UserLogin />
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
