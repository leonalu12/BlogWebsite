<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import CommentItem from "./CommentItem.svelte";
  import { PUBLIC_API_BASE_URL} from "$env/static/public";
  import { displayLogin } from "../store/userStore";
  import { commentAmount } from "../store/commentStore";
  
  export let article;
  let article_id = article.id;
  export let user = writable(null);
  const comments = writable([]);

  let user_id = null; 
  // Set the default value
  $: if ($user) {
    user_id = $user.id;
  }
  let content = "";
  onMount(async()=>{
  await fetchComments();
  await fetchUser();}
  );
  
  async function fetchUser() {
    try {    
      const res = await fetch(`${PUBLIC_API_BASE_URL}/users`, {
      method: "get",
      credentials: "include"
    });
    if (res.ok) {
      const userData = await res.json();
      user.set(userData);}
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    }

  function buildCommentTree(commentsArray) {
  const commentMap = new Map(); 
  // store all the comments
  const rootComments = [];

  // First pass: initialize comments and map
    commentsArray.forEach(comment => {
    comment.children = []; 
    // Initialize children array
    commentMap.set(comment.id, comment);});

  // Second pass: build tree structure
  commentsArray.forEach(comment => {
    if (comment.parent_cid) {
      let parentComment = commentMap.get(comment.parent_cid);
        if (!parentComment) {
          // If the parent comment is not found, treat it as a root comment
          rootComments.push(comment);
          return;
        }
      // Find the target parent comment (where the comment will be displayed)
      let targetParent = parentComment;
      if (parentComment.layer >= 3) {
        // If the parent comment's layer is 3 or above, move up to the second-level ancestor
        let ancestor = parentComment;
        while (ancestor.parent_cid && ancestor.layer > 2) {
          ancestor = commentMap.get(ancestor.parent_cid);
        }
        targetParent = ancestor;
      }

      // Keep the original layer value, but place it at the third layer for display
      comment.displayLayer = targetParent.layer >= 2 ? 3 : targetParent.layer + 1;
      
      // Add the comment to the target parent’s children
      targetParent.children.push(comment);
    } else {
      // Root level comments
      comment.displayLayer = 1;
      rootComments.push(comment);
    }
  })
  
  // Final pass: sort children by date or other criteria if needed
  function sortComments(comments) {
    comments.forEach(comment => {
      if (comment.children.length > 0) {
        comment.children.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
        sortComments(comment.children);
      }
    });
  }
  sortComments(rootComments);
  return rootComments;
}


  // Fetch comments and likes
  async function fetchComments() {
    const res = await fetch(`http://localhost:3000/api/comments/${article_id}`);
    if (res.ok) {
      let commentsData = await res.json();
      // Get the like count for each comment
      for (let comment of commentsData) {
        const likeRes = await fetch(`http://localhost:3000/api/comments/${comment.id}/likes`);
        if (likeRes.ok) {
          const { likes } = await likeRes.json();
          comment.likes = likes;
        } else {
          comment.likes = 0;
        }
      }
      //get comments from backend and build in tree pattern.
      comments.set(buildCommentTree(commentsData));
      console.log(comments);
    }
  }

//add comment to article
  async function addComment() {
    if (!$user) {
      displayLogin.set(true);
      return;
    }
    if (!content.trim()) return;

    const newComment = {
      content,
      layer: 1,
      date_time:new Date().toLocaleString(),
      user_id,
      article_id: article_id,
      parent_cid:  null
    }
    
    const res = await fetch("http://localhost:3000/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newComment)
    });
    if (res.ok) {

      commentAmount.update(n => n + 1); // Update the comment amount
      console.log(commentAmount); // Log the updated comment amount
      const newCommentData = await res.json(); 
      // Get new comment data
      comments.update(current => {
      let flatComments = [];
      
      // Recursively traverse the tree and store all comments in `flatComments`
      function flattenTree(commentsArray) {
        for (let comment of commentsArray) {
          flatComments.push(comment);
          if (comment.children && comment.children.length > 0) {
            flattenTree(comment.children);
          }
        }
      }
      flattenTree($comments); 
      // First convert the current tree to a list

      flatComments.push(newCommentData); 
      // Add the new comment

      return buildCommentTree(flatComments); 
      // Rebuild the tree structure
    });
      content = ""; 
      // Clear the input box

    }
  }

  
//reply to other comments  
  let replyContent = {}; 
  // Store the reply content for each comment
  let replyBoxVisible = {}; 
  // Control the visibility of the reply box for each comment
  async function startReply(parentComment) {

    const content = replyContent[parentComment.id]?.trim();
    if (!content) return;

    const res = await fetch("http://localhost:3000/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        content,
        layer: parentComment.layer + 1, 
        date_time: new Date().toLocaleString(),
        user_id, 
        article_id: article_id,
        parent_cid: parentComment.id, 
        // Link to the parent comment
        children:[]
      })
    });

    if (res.ok) {
      const newComment = await res.json();
      comments.update(current => {
        const flatComments = [];
        function flattenTree(commentsArray) {
          for (let comment of commentsArray) {
            flatComments.push({ ...comment });
            if (comment.children?.length > 0) {
              flattenTree(comment.children);
            }
          }
        }
        flattenTree(current);
        flatComments.push(newComment);
        
        return buildCommentTree(flatComments);
      });
      replyContent[parentComment.id] = ""; 
      // Clear the input box content
      replyBoxVisible[parentComment.id] = false; 
      // Hide the reply box after submission
      commentAmount.update(n => n + 1); // Update the comment amount
      console.log(commentAmount); // Log the updated comment amount
    } else {
      console.error("Failed to reply to comment:", res.status);
    }
  }

  function toggleReplyBox(comment) {
    if (!$user) {
      displayLogin.set(true);
      return;
    }
    replyBoxVisible[comment.id] = !replyBoxVisible[comment.id]; 
    // Toggle the input box visibility
  }

</script>


<div class="comments-container">
  <div class="new-comment">
    <input
      class="comment-box"
      type="text"
      bind:value={content}
      placeholder="your comment here..."
      on:keypress={(e) => e.key === 'Enter' && addComment()}
    />
    <button class="comment-btn" on:click={addComment} disabled={!content.trim()}>
      Post
    </button>
  </div>

  <div class="comments-list">
    {#each $comments as comment}
    <CommentItem
    bind:replyContent
    bind:replyBoxVisible
    {user}
    {article}
    {toggleReplyBox}
    {startReply}
    comment={comment}
  />

    {/each}
  </div>
</div>

<style>
  .comments-container {
    padding: 15px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .new-comment {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  .comment-box {
    flex: 1;
    padding: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .comment-box:focus {
    outline: none;
    border-color: pink;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .comment-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background: linear-gradient(90deg, pink, #FFE4E1);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .comment-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .comment-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .comments-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
  }

  .comments-list::-webkit-scrollbar {
    width: 6px;
  }

  .comments-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .comments-list::-webkit-scrollbar-thumb {
    background: #FFE4E1;
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    .comments-container {
      padding: 10px;
    }

    .comment-box {
      padding: 10px;
    }
  }
</style>