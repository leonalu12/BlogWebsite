<script>
    import { ArrowLeftCircleIcon, Heart, LogIn, MessageCircle } from "lucide-svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { goto } from '$app/navigation';
    import Comments from '../../../lib/components/Comments.svelte';
    import { onMount } from "svelte";
    import { writable } from "svelte/store"; // ✅ 存储用户信息
    import AlertWindow from "../../../lib/components/utils/AlertWindow.svelte";
    import { displayLogin } from "../../../lib/store/userStore";
    import { logedIn } from "../../../lib/store/userStore";
    import { iconName } from "../../../lib/store/userStore";

    export let data;
    const article = data?.article || {}; // ✅ 避免 `null`
    
    let likeCount = article?.like_count ?? 0;
    let isLiked = false;

    let showComments = false; // ✅ 控制评论区是否展开
    
    let user = writable(null); // ✅ 存储用户信息
    
    let showErrorWindow = false;
    let errorWindowMessage = "";

    // ✅ 获取用户信息
    async function fetchUser() {
        
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/users/`, {
                method: "GET",
                credentials: "include" // ✅ 让请求带上 session
            });

            if (res.ok) {
                const userData = await res.json();
                user.set(userData); // ✅ 存储用户信息
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
                credentials: "include" // ✅ 让请求带上 session
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




    async function toggleLike(event) {
        event.stopPropagation();

        if (!article?.id) {
            errorWindowMessage = "Error: Article ID is undefined. Cannot like.";
            showErrorWindow = true;
            return;
        }

        let currentUser;
        user.subscribe(value => currentUser = value)();

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
                credentials: "include" // ✅ 让 session 传递到后端
            });

            if (!response.ok) throw new Error("API 请求失败");

            const data = await response.json();
            isLiked = newLikeStatus;
            likeCount = data.like_count;
        } catch (error) {
            errorWindowMessage = "Failed to like article.";
            showErrorWindow = true;
        }
    }

    function toggleComments() {
        showComments = !showComments; // ✅ 切换评论区的展开/收起状态
    }

    function handleErrorConfirm() {
        showErrorWindow = false;
    }

    console.log("文章数据:", article);
    
</script>

<svelte:head>
    <title>{article?.title || "Loading..."}</title>  
</svelte:head>

{#if article?.id}
    <div class="article-container">
        <div class="article-image">
            <img src={article.image_url ? article.image_url : "/images/default-placeholder.jpg"} alt={article.title} />
        </div>

        <div class="article-content">
            <h1>{article.title || "Untitled"}</h1>
            <p class="article-meta">Published on {article.date_time || "Unknown"} by {article.username || "Anonymous"}</p>
            <p class="article-text">{@html article.content || "No content available."}</p>

            <div class="article-actions">
                <button class="like-button" on:click={toggleLike}>
                    <Heart size={20} fill={isLiked ? "red" : "none"} color="red" /> {likeCount}
                </button>
                <button class="comment-button" on:click={toggleComments}> 
                    <MessageCircle size={20} color={showComments ? "black" : "blue"} /> {article.comment_count ?? 0}
                </button>

                {#if $user && $user.id === article.user_id}
                <button class="edit-button" on:click={() => goto(`/articles/${article.id}/edit`)}>
                    edit
                </button>
                {/if}
            </div>
        </div>
    </div>

<!-- ✅ 仅当 `showComments` 为 `true` 时显示评论区 -->
{#if showComments}
<Comments article={article} />
{/if}
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
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    .article-image img {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        border-radius: 10px;
    }
    .article-content {
        text-align: center;
        padding: 20px;
    }
    .article-meta {
        font-size: 14px;
        color: gray;
    }
    .article-text {
        text-align: left;
        font-size: 16px;
        line-height: 1.6;
    }
    .article-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
    }
    .like-button, .comment-button {
        display: flex;
        align-items: center;
        gap: 5px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 16px;
    }
    .like-button:hover {
        color: red;
    }
    .comment-button:hover {
        color: blue;
    }
    .edit-button {
        color: green;
    }
    .edit-button:hover {
        text-decoration: underline;
    }
</style>
