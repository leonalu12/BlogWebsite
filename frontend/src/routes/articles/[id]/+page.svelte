<script>
  import { ArrowLeftCircleIcon, Heart, LogIn, MessageCircle } from "lucide-svelte";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { goto } from "$app/navigation";
  import Comments from "../../../lib/components/Comments.svelte";
  import { onMount } from "svelte";
  //Store user information
  import { writable } from "svelte/store"; 
  import AlertWindow from "../../../lib/components/utils/AlertWindow.svelte";
  import { displayLogin } from "../../../lib/store/userStore";
  import { logedIn } from "../../../lib/store/userStore";
  import { iconName } from "../../../lib/store/userStore";
  import { commentAmount } from "../../../lib/store/commentStore";

  export let data;
  // ✅ Avoid `null`
  const article = data?.article || {}; 

  let likeCount = article?.like_count ?? 0;
  let isLiked = false;
  //Control whether the comment section is expanded
  let showComments = false; 

  //Save user information
  let user = writable(null); 

  let showErrorWindow = false;
  let errorWindowMessage = "";

  //  Get user information
  async function fetchUser() {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/users/`, {
        method: "GET",
        // Include session in the request
        credentials: "include" 
      });

      if (res.ok) {
        const userData = await res.json();
        //✅ Store user information
        user.set(userData); 
        console.log("✅ Fetched user:", userData);
      } else if (res.status === 401) {
        console.error("❌ User is not logged in. Redirecting...");
      }
    } catch {
      errorWindowMessage = "Error fetching user.";
      showErrorWindow = true;
    }
  }

  async function fetchIsLiked() {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${article.id}/like/check`, {
        method: "GET",
        credentials: "include" 
      });

      if (res.ok) {
        const data = await res.json();
        isLiked = data.isLiked;
        console.log("✅ Fetched like status:", data);
      } else {
        console.error("❌ Error fetching like status:", res.status);
      }
    } catch (error) {
      console.error("❌ Error fetching like status:", error);
    }
  }

  onMount(() => {
    fetchUser();
    fetchIsLiked();
    if (!article.image_url){
        showComments = true;
    }
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

          
          throw new Error("Failed to get user avatar");
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

  async function toggleLike(event) {
    event.stopPropagation();

    if (!article?.id) {
      errorWindowMessage = "Error: Article ID is undefined. Cannot like.";
      showErrorWindow = true;
      return;
    }

    let currentUser;
    user.subscribe((value) => (currentUser = value))();

    if (!currentUser) {
      errorWindowMessage = "User is not logged in.";
      displayLogin.set(true);
      return;
    }

    const newLikeStatus = !isLiked;
    try {
      const method = newLikeStatus ? "POST" : "DELETE";

      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${article.id}/like`, {
        method,
        headers: { "Content-Type": "application/json" },
        // Pass session to the backend
        credentials: "include" 
      });

      if (!response.ok) throw new Error(" API request failed");

      const data = await response.json();
      isLiked = newLikeStatus;
      likeCount = data.like_count;
    } catch (error) {
      errorWindowMessage = "Failed to like article.";
      showErrorWindow = true;
    }
  }

  function toggleComments() {
    // Toggle comment section expand/collapse state
    showComments = !showComments; 
  }

  function handleErrorConfirm() {
    showErrorWindow = false;
  }

  console.log("Article data:", article);
</script>

<svelte:head>
  <title>{article?.title || "Loading..."}</title>
</svelte:head>

{#if article?.id}
  <div class="article-container">
    <div class="article-left-column">
      <div class="article-image">
        {#if article.image_url}
        <img
        src={article.image_url ? article.image_url : "/images/default-placeholder.jpg"}
          alt={article.title}
        />
        {/if}
        {#if showComments}
          <div class="comments-overlay">
            <Comments {article} />
          </div>
        {/if}
        {#if showComments}
          <div class="comments-overlay">
            <Comments {article} />
          </div>
        {/if}
      </div>
    </div>

    <div class="article-right-column">
     
      <div class="article-content">
        <h1>{article.title}</h1>
        <div class="article-meta">
          <span>By: {article.username}</span>
          <span>Published on: {article.date_time}</span>
        </div>
        <div class="article-text">
          {@html article.content}
        </div>
      </div>
    </div>
    <div class="article-actions">
      <button class="like-button" on:click={toggleLike}>
        <Heart size={20} fill={isLiked ? "red" : "none"} color="red" />
        {likeCount}
      </button>
      <button class="comment-button" on:click={toggleComments}>
        <MessageCircle size={20} color={showComments ? "black" : "blue"} />
        {$commentAmount}
      </button>
      {#if $user && $user.id === article.user_id}
        <button class="edit-button" on:click={() =>{goto(`/articles/${article.id}/edit`);
          
        } }>
          edit
        </button>
      {/if}
    </div>
  </div>


{:else}
  <p>Loading article...</p>
{/if}
{#if showErrorWindow}
  <AlertWindow message={errorWindowMessage} on:confirm={handleErrorConfirm} />
{/if}

{#if $displayLogin}
  <LogIn />
{/if}

<style>
  .article-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 95px auto 40px;
    max-width: 1200px;
    padding: 20px;
    padding-top: 0;
    padding-bottom: 0;
    margin: 0 10%;
    z-index: 20;
  }

  .article-left-column {
    position: relative;
    position: sticky;
    top: 95px;
    height: calc(100vh - 110px);
    z-index: 19;
    width: 100%;
     word-wrap: break-word;
    overflow-wrap: break-word;
    overflow-x: auto;
  }

  .article-image {
    position: relative;
    height: 100%;
    background: white;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 15px;
  }

  .comments-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 20px;
    overflow-y: auto;
  }

  
  .article-right-column {
    height: calc(100vh - 110px);
    position: relative;
    background: white;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    overflow-y: auto; /* 改为 overflow-y */
  }

  .article-content {
    height: 100%;
    padding: 0 20px;
   

  }

  .article-meta {
    color: #666;
    font-size: 0.9em;
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
  }

  .article-text {
    line-height: 1.6;
    margin: 20px 0;
  }

  .article-actions {
    position: absolute; 
    display: flex;
    flex-direction: column;
    top: 115px; 
    right: 13%;
    display: flex;
    width: 50px;
    gap: 10px;
    z-index: 29; 
    padding: 10px;
    background: rgba(255, 255, 255, 0.9); 
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .like-button,
  .comment-button,
  .edit-button {
    background: linear-gradient(90deg, rgba(255,192,203,0.8), rgba(255,228,225,0.8));
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: transform 0.2s ease;
    font-size: 12px;
  }

  .edit-button{
    font-size: 11px;
  }

  .like-button:hover,
  .comment-button:hover,
  .edit-button:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .article-container {
      grid-template-columns: 1fr;
    }

    .article-left-column {
      position: relative;
      height: 300px;
      top: 0;
    }

    .article-actions {
      position: sticky;
      top: 0;
      right: 0;
      background: white;
      width: 100%;
      justify-content: flex-end;
      border-radius: 0;
      padding: 10px 20px;
      margin-bottom: 10px;
    }

    .article-right-column {
      padding-top: 20px;
    }
  }
  .comments-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 20px;
    overflow-y: auto;
    transition: all 0.3s ease;
  }

  .article-image {
    position: relative;
    height: 100%;
  }

  
</style>
