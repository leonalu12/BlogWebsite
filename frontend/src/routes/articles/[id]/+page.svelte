<script>
    import { Heart, MessageCircle } from "lucide-svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { goto } from '$app/navigation'; //引入 SvelteKit 的页面跳转函数
    import Comments from './Comments/Comments.svelte';  // 直接导入组件
    export let data;
    const { article } = data;
    //存储文章的当前点赞数，如果undefine或者null则显示0
    let likeCount = article.like_count || 0;
    //存储用户是否已点赞该文章。如果 article.isLiked 为 undefined 或 null，则默认值为 false
    let isLiked = article.isLiked || false;

    const userId = 2; // 假设当前用户 ID

    async function toggleLike(event) {
        event.stopPropagation();//阻止事件冒泡，避免触发其他点击事件

        const newLikeStatus = !isLiked;// 切换点赞状态
        console.log("当前 isLiked 状态:", isLiked);
        console.log("切换后的 newLikeStatus:", newLikeStatus);

        try {
            const method = newLikeStatus ? "POST" : "DELETE";
            console.log(`发送请求: ${method} ${PUBLIC_API_BASE_URL}/articles/${article.id}/like`);

            const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${article.id}/like`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) throw new Error("API 请求失败");

            const data = await response.json();
            console.log("API 返回的数据:", data);

            isLiked = newLikeStatus;
            likeCount = data.like_count; // ✅ 确保点赞数从 API 更新
            console.log("✅ UI 更新: isLiked =", isLiked, "likeCount =", likeCount);
        } catch (error) {
            console.error("❌ 点赞失败:", error);
        }
    }

    console.log("当前用户ID:", userId);
    console.log("文章作者ID:", article.user_id);
    console.log("文章数据:", article);

</script>

<svelte:head>
    <title>{article.title}</title>  
</svelte:head>

<div class="article-container">
    <div class="article-image">
        <img src={article.image_url ? article.image_url : "/images/default-placeholder.jpg"} alt={article.title} />
    </div>

    <div class="article-content">
        <h1>{article.title}</h1>
        <p class="article-meta">Published on {article.date_time} by {article.username}</p>
        <p class="article-text">{@html article.content}</p>

        <div class="article-actions">
            <button class="like-button" on:click={toggleLike}>
                <Heart size={20} fill={isLiked ? "red" : "none"} color="red" /> {likeCount}
            </button>
            <button class="comment-button">
                <MessageCircle size={20} color="blue" /> {article.comment_count || 0}
            </button>

            {#if userId === article.user_id}  <!-- ✅ 修改：添加判断是否是文章作者 -->
            <button class="edit-button" on:click={() => goto(`/articles/${article.id}/edit`)}>
                edit
            </button>
        {/if} <!-- ✅ 修改结束 -->
        </div>
    </div>
</div>

<Comments article = {article} />

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
    .edit-button {  /* ✅ 修改：添加编辑按钮样式 */
        color: green;
    }
    .edit-button:hover {
        text-decoration: underline;
    }
</style>