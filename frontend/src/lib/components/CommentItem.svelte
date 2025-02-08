<script>
  import { writable } from "svelte/store";
  // import CommentItem from "../components/CommentItem.svelte"-->
  import DeleteConfirmWindow from "../components/utils/DeleteConfirmWindow.svelte";
  import { tick } from "svelte";
  export let comment={};
  export let replyContent;
  export let replyBoxVisible;
  export let user_id;
  export let toggleReplyBox;
  export let startReply;
  let showDeleteConfirm = false; // 控制删除确认框的显示
  let replyInput; // 用于存储回复框的 DOM 参考

  // 触发删除确认弹窗
  function triggerDeleteConfirm() {
    showDeleteConfirm = true;
  }

  // 确认删除评论
  async function confirmDelete() {
    const res = await fetch(`http://localhost:3000/api/comments/${comment.id}`, { method: "DELETE" });
    if (res.ok) {
      comment.deleted = true; // 标记已删除，触发 Svelte 更新
    }
    showDeleteConfirm = false;
  }

  // 取消删除
  function cancelDelete() {
    showDeleteConfirm = false;
  }

  // 点赞 / 取消点赞
  async function toggleLike() {
    const res = await fetch(`http://localhost:3000/api/comments/${comment.id}/like`, {
      method: comment.userLiked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id })
    });

    if (res.ok) {
      comment.userLiked = !comment.userLiked;
      comment.likes += comment.userLiked ? 1 : -1;
    }
  }

  // 修改 toggleReplyBox 逻辑，使其在显示输入框后自动聚焦
  async function handleToggleReplyBox(comment) {
    toggleReplyBox(comment);
    await tick(); // 等待 DOM 更新
    replyInput?.focus(); // 聚焦到输入框
  }

  // 监听 Enter 键提交评论
  function handleKeyDown(event, comment) {
    if (event.key === "Enter") {
      event.preventDefault(); // 防止换行
      startReply(comment); // 触发提交
    }
  }
</script>
  
  {#if !comment.deleted} <!-- 仅在评论未被删除时渲染 -->
  <div class="comment-item" style="margin-left: {comment.displayLayer * 20}px">
    <div class="comment-content">
      <div class="user-info">
        <img class="user-avatar" src={comment.icon} alt={comment.username} />
        <span class="username">{comment.username}</span>
        <span class="comment-time">{comment.date_time}</span>
      </div>
      <p>{comment.content}</p>
      <div class="comment-actions">
        <button on:click={toggleLike}>
          {comment.userLiked ? "❤️ Unlike" : " Like"} ({comment.likes || 0})
        </button>
        <button on:click={() => handleToggleReplyBox(comment)}>Reply</button>
        <button on:click={triggerDeleteConfirm}>❌ Delete</button>
      </div>
      
      {#if replyBoxVisible[comment.id]}
        <div class="reply-box">
          <input 
            type="text" 
            bind:this={replyInput} 
            bind:value={replyContent[comment.id]} 
            placeholder="Write a reply..."
            on:keydown={(event) => handleKeyDown(event, comment)} 
          />
          <button on:click={() => startReply(comment)}>Post</button>
        </div>
      {/if}
    </div>

    <!-- 递归渲染子评论 -->
    {#if comment.children?.length}
      <div class="comment-children">
        {#each comment.children as childComment}
          {#if comment.displayLayer <= 3}
            <svelte:self
              bind:replyContent
              bind:replyBoxVisible
              {user_id}
              {toggleReplyBox}
              {startReply}
              comment={childComment}
            />
            <!-- Show after layer 3 -->
          <!-- {:else} -->
          <!-- <div class="nested-comment">
            <div class="user-info">
              <img class="user-avatar" src={childComment.icon} alt={childComment.username} />
              <span class="username">{childComment.username}</span>
              <span class="comment-time">{childComment.date_time}</span>
            </div>
            <p>{childComment.content}</p>
            <div class="comment-actions">
              <button on:click={() => toggleLike(childComment)}>
                {childComment.userLiked ? "💔 Unlike" : "❤️ Like"} ({childComment.likes || 0})
              </button>
              <button on:click={() => toggleReplyBox(childComment)}>Reply</button>
              <button on:click={() => triggerDeleteConfirm(childComment)}>❌ Delete</button>
            </div>
            
            {#if replyBoxVisible[childComment.id]}
              <div class="reply-box">
                <input 
                  type="text" 
                  bind:value={replyContent[childComment.id]} 
                  placeholder="Write a reply..."
                />
                <button on:click={() => startReply(childComment)}>Post</button>
              </div>
            {/if}
          </div> -->
          {/if}
        {/each}
      </div>
 
    {/if}
  <!-- 删除确认弹窗 -->
  {#if showDeleteConfirm}
    <DeleteConfirmWindow
      message="Are you sure to delete this comment?"
      on:confirm={confirmDelete}
      on:cancel={cancelDelete}
    />
  {/if}
</div>
{/if}
  
  <style>
    .comment-item {
      border-left: 2px solid #ddd;
      margin-top: 8px;
      
    }
    .comment-content {
    background: #f9f9f9;
    padding: 12px;
    border-radius: 8px;
  }
  .comment-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .reply-box {
    margin-top: 8px;
  }

  /* .nested-comment {
    background: #f5f5f5;
    padding: 8px;
    margin-top: 8px;
    border-radius: 6px;
  } */

  .user-info {
    display: flex;
    align-items: center;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .username {
    font-weight: bold;
  }

  .comment-time {
    font-size: 0.9rem;
    color: gray;
    margin-left: 10px;
  }
  </style>
