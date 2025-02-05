<!-- <script>
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    // import CommentItem from "../components/CommentItem.svelte"
    export let comment;
    export let replyContent;
    export let replyBoxVisible;
    export let deleteComment;
    export let startReply;
    export let toggleReplyBox;
  
    // 监听可见状态
    let isReplyVisible = writable(false);
  
    function handleToggleReply() {
      isReplyVisible.update(current => !current);
    }
  </script>
  
  <div class="comment-item" style="margin-left: {comment.layer * 24}px">
    <div class="comment-content">
      <p>{comment.content}</p>
      <div class="comment-actions">
        <button on:click={() => toggleReplyBox(comment)}>Reply</button>
        <button on:click={() => deleteComment(comment.id)}>❌ Delete</button>
      </div>
      
      {#if replyBoxVisible[comment.id]}
        <div class="reply-box">
          <input
            type="text"
            bind:value={replyContent[comment.id]}
            placeholder="Write a reply..."
          />
          <button on:click={() => startReply(comment)}>Post</button>
        </div>
      {/if}
    </div>
  
    {#if comment.children?.length}
      <div class="comment-children">
        {#each comment.children as childComment}
          <CommentItem
            comment={childComment}
            replyContent={replyContent}
            replyBoxVisible={replyBoxVisible}
            deleteComment={deleteComment}
            startReply={startReply}
            toggleReplyBox={toggleReplyBox}
          />
        {/each}
      </div>
    {/if}
  </div>
  
  <style>
    .comment-item {
      border-left: 2px solid #ddd;
      padding-left: 12px;
      margin-top: 8px;
    }
  </style>
   -->