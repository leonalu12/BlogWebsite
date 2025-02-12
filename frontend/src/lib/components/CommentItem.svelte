<script>
  import DeleteConfirmWindow from "../components/utils/DeleteConfirmWindow.svelte";
  import { displayLogin } from "../store/userStore";
  import { tick } from "svelte";
  export let comment={};
  export let replyContent;
  export let replyBoxVisible;
  export let user;
  export let toggleReplyBox;
  export let startReply;
  export let article;
  let showDeleteConfirm = false; 
  // Control the visibility of the delete confirmation box
  let replyInput; 
  // DOM reference for storing the reply box
  let user_id = null; 
  // Set default value
  $: if ($user) {
    user_id = $user.id;
  }
  // Trigger the delete confirmation popup
  function triggerDeleteConfirm() {
    showDeleteConfirm = true;
  }

  // Confirm comment deletion
  async function confirmDelete() {
    const res = await fetch(`http://localhost:3000/api/comments/${comment.id}`, { method: "DELETE" });
    if (res.ok) {
      comment.deleted = true; 
      // Mark as deleted and trigger Svelte update
    }
    showDeleteConfirm = false;
  }

  // Cancel delete
  function cancelDelete() {
    showDeleteConfirm = false;
  }

  // like / unlike
  async function toggleLike() {
    if (!$user) {
      displayLogin.set(true);
      return;
    }
    const res = await fetch(`http://localhost:3000/api/comments/${comment.id}/like`, {
      method: comment.userLiked ? "DELETE" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id })
    });

    if (res.ok) {
      comment.userLiked = !comment.userLiked;
      comment.likes += comment.userLiked ? 1 : -1;
    }
  }

  // Modify toggleReplyBox logic to automatically focus the input box after showing it
  async function handleToggleReplyBox(comment) {
    toggleReplyBox(comment);
    await tick(); 
    // Wait for DOM update
    replyInput?.focus(); 
    // Focus on the input box
  }

  // Listen for the Enter key to submit the comment
  function handleKeyDown(event, comment) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent line break
      startReply(comment); // Trigger submission
    }
  }
</script>

  <!-- Only render when the comment is not deleted  -->
  {#if !comment.deleted} 
  <div class="comment-item" style="margin-left: {comment.displayLayer * 20}px">
    <div class="comment-content">
      <div class="user-info">
        <img class="user-avatar" src={`http://localhost:3000/images/${comment.icon}`} alt={comment.username} />
        <span class="username">{comment.username}</span>
        <span class="comment-time">{comment.date_time}</span>
      </div>
      {#if comment.parent_username}
        <div class="reply-to">
          Reply <span class="reply-username">@{comment.parent_username}</span>
        </div>
      {/if}
      <p>{comment.content}</p>
      <div class="comment-actions">
        <button on:click={toggleLike} class="icon-btn">
          {@html comment.userLiked 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="red" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24">
                 <path fill="red" d="M12 4.528a6 6 0 0 0-8.243 8.715l6.829 6.828a2 2 0 0 0 2.828 0l6.829-6.828A6 6 0 0 0 12 4.528m-1.172 1.644l.465.464a1 1 0 0 0 1.414 0l.465-.464a4 4 0 1 1 5.656 5.656L12 18.657l-6.828-6.829a4 4 0 0 1 5.656-5.656"/>
               </svg>`}
          {comment.likes || 0}
        </button>
        
        <button on:click={() => handleToggleReplyBox(comment)} class="icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.5 8.046H11V6.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49c.624.556 1.524.027 1.524-.893v-1.928h2a3.023 3.023 0 0 1 3 3.046V19a5.593 5.593 0 0 0-1.5-10.954"/>
          </svg>Reply
        </button>
        <!-- Only comment owner/article owner can see the "Delete" button -->
        {#if user_id &&( user_id == comment.user_id || user_id == article.user_id) }
          <button on:click={triggerDeleteConfirm} class="icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm1 2H6v12h12zm-9 3h2v6H9zm4 0h2v6h-2zM9 4v2h6V4z"/>
            </svg>
            Delete</button>
        {/if}
      </div>
      
      {#if replyBoxVisible[comment.id]}
      
        <div class="reply-box">
          <input 
            type="text" 
            class="reply-input"
            bind:this={replyInput} 
            bind:value={replyContent[comment.id]} 
            placeholder="Write a reply..."
            on:keydown={(event) => handleKeyDown(event, comment)} 
          />
          <button 
          class="reply-submit"
          on:click={() => startReply(comment)}>Post</button>
        </div>
      {/if}
    </div>

    <!-- Recursive rendering of child comments -->
    {#if comment.children?.length}
      <div class="comment-children">
        {#each comment.children as childComment}
          {#if comment.displayLayer <= 3}
            <svelte:self
              bind:replyContent
              bind:replyBoxVisible
              {user}
              {article}
              {toggleReplyBox}
              {startReply}
              comment={childComment}
            />
          {/if}
        {/each}
      </div>
 
    {/if}
  <!-- Delete confirmation popup -->
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
      border-left: 2px solid #FFE4E1;
      margin: 12px 0;
      padding-left: 5px;
    }
  
    .comment-content {
      background: white;
      padding: 10px 15px;
      border-radius: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease;
    }
  
    .comment-content:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  
    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    .username {
      font-weight: 600;
      color: #333;
    }
  
    .comment-time {
      font-size: 0.9rem;
      color: #666;
      margin-left: 10px;
    }
  
    .comment-actions {
      display: flex;
      gap: 12px;
      margin-top: 10px;
      justify-content: flex-end;
    }
  
    .reply-box {
      margin-top: 12px;
    }
  
    .reply-to {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0;
    }
  
    .reply-username {
      font-weight: 600;
      color: pink;
    }
  
    .icon-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border: none;
      border-radius: 20px;
      background: linear-gradient(90deg, pink, #FFE4E1);
      color: white;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
  
    .icon-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    .icon-btn svg {
      transition: transform 0.2s ease;
    }
  
    @media (max-width: 768px) {
      .comment-content {
        padding: 12px;
      }
  
      .user-avatar {
        width: 32px;
        height: 32px;
      }
    }
    .reply-box {
      margin-top: 12px;
      display: flex;
      gap: 10px;
    }
    
    .reply-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 15px;
      font-size: 0.9rem;
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.2s ease;
    }
    
    .reply-input:focus {
      outline: none;
      border-color: pink;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background: white;
    }
    
    .reply-submit {
      padding: 8px 16px;
      border: none;
      border-radius: 20px;
      background: linear-gradient(90deg, pink, #FFE4E1);
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .reply-submit:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .reply-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  </style>