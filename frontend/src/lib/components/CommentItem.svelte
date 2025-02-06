<script>
    import { writable } from "svelte/store";
    // import CommentItem from "../components/CommentItem.svelte"-->
  export let comment={};
  export let replyContent;
  export let replyBoxVisible;
  export let user_id;
  export let toggleReplyBox;
  export let startReply;
  export let deleteComment;
  </script>
  
  <div class="comment-item" style="margin-left: {comment.layer * 20}px">
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
          <svelte:self
           bind:replyContent
           bind:replyBoxVisible
           {user_id}
           {toggleReplyBox}
           {startReply}
            {deleteComment}
            comment = {childComment}
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
  </style>
