<script>
    import { ArrowLeftCircleIcon, Heart, MessageCircle } from "lucide-svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { goto } from '$app/navigation';
    import Comments from '../../../lib/components/Comments.svelte';
    import { onMount } from "svelte";
    import { writable } from "svelte/store"; // ✅ 存储用户信息

    export let data;
    const article = data?.article || {}; // ✅ 避免 `null`
    
    let likeCount = article?.like_count ?? 0;
    let isLiked = article?.isLiked ?? false;

    let showComments = false; // ✅ 控制评论区是否展开
    
    let user = writable(null); // ✅ 存储用户信息

    // ✅ 获取用户信息
    async function fetchUser() {
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/users/withoutAuth`, {
                method: "GET",
                credentials: "include" // ✅ 让请求带上 session
            });

            if (res.ok) {
                const userData = await res.json();
                user.set(userData); // ✅ 存储用户信息
                console.log("✅ Fetched user:", userData);
            } else if (res.status === 401) {
                console.error("❌ User is not logged in. Redirecting...");
                goto("/login");
            }
        } catch (error) {
            console.error("❌ Error fetching user:", error);
        }
    }

    onMount(fetchUser); // ✅ 页面加载时获取用户信息

    async function toggleLike(event) {
        event.stopPropagation();

        if (!article?.id) {
            console.error("❌ Error: Article ID is undefined. Cannot like.");
            return;
        }

        let currentUser;
        user.subscribe(value => currentUser = value)();

        if (!currentUser) {
            console.error("❌ User is not logged in.");
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
            console.error("❌ 点赞失败:", error);
        }
    }

    function toggleComments() {
        showComments = !showComments; // ✅ 切换评论区的展开/收起状态
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
