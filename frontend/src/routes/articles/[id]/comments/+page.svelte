<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import CommentItem from "../../../../lib/components/CommentItem.svelte";
  export let data;
  let comments = writable(buildCommentTree(data.comments));
  console.log(comments);

  import {page} from '$app/stores';
  export function load({params}){
    const {id} = params;
    return {id};
  }
  $: article_id = $page.params.id;
  let content = "";
  let user_id =1; //need to change!
  

  // 将评论数据转换为树形结构
  function buildCommentTree(commentsArray) {
    const commentMap = new Map();//store all the comments
    const rootComments = [];

    commentsArray.forEach(comment => {
      comment.children = []; // 添加 children 数组属性, 存储子评论
      commentMap.set(comment.id, comment);
    // 构建树形结构
      if (comment.parent_cid) {
        const parentComment = commentMap.get(comment.parent_cid);//找到父评论
        if (parentComment) {
          parentComment.children.push(comment);//将当前评论添加到父评论的 children 数组中
        }
      } else {
        rootComments.push(comment);}//没有父评论的是根评论
    });
    
    return rootComments;
  }
    


  // 获取评论和点赞数
  async function fetchComments() {
    const res = await fetch(`http://localhost:3000/api/comments/${article_id}`);
    if (res.ok) {
      let commentsData = await res.json();

      // 获取每个评论的点赞数
      for (let comment of commentsData) {
        const likeRes = await fetch(`http://localhost:3000/api/comments/${comment.id}/likes`);
        if (likeRes.ok) {
          const { likes } = await likeRes.json();
          comment.likes = likes;
        } else {
          comment.likes = 0;
        }
      }

      comments.set(commentsData);
    }
  }

  onMount(fetchComments);

//add comment to article
  async function addComment() {
    if (!content.trim()) return;

    const newComment = {
      content,
      layer: 1,
      date_time:new Date().toISOString,
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
      const newCommentData = await res.json(); // 获取新评论数据
        comments.update(current => {
        // 直接将新评论添加到现有数组中
        return buildCommentTree([...current.flat(), newCommentData]);
      });
      content = ""; // 清空输入框

    }
  }

  //like and unlike
   async function toggleLike(comment) {
    const res = await fetch(`http://localhost:3000/api/comments/${comment.id}/like`, {
      method: comment.userLiked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id })
    });

    if (res.ok) {
      comment.userLiked = !comment.userLiked;
      comment.likes += comment.userLiked ? 1 : -1;
      comments.update(cs => [...cs]); // 触发 Svelte 更新
    }
  }

  // delete
  async function deleteComment(commentId) {
    const res = await fetch(`http://localhost:3000/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      await fetchComments(); // 重新获取评论
    }
  }
  
//reply to other comments  
  let replyContent = {}; // 存储每个评论的回复内容
  let replyBoxVisible = {}; // 控制每个评论的回复框是否可见
  async function startReply(parentComment) {
    const content = replyContent[parentComment.id]?.trim();
    if (!content) return;

    const res = await fetch("http://localhost:3000/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        content,
        layer: parentComment.layer + 1 > 3 ? 3 : parentComment.layer + 1, // 最多 3 层
        date_time: new Date().toISOString(),
        user_id: 1, // 这里需要改成用户ID
        article_id: article_id,
        parent_cid: parentComment.id, // 关联父级评论
        children:[]
      })
    });

    if (res.ok) {
      const newComment = await res.json();
      if (!Array.isArray(parentComment.children)) {
      parentComment.children = []; // 如果 undefined，则初始化为空数组
    }
      parentComment.children = [...parentComment.children, newComment];//插入父评论的children组
      replyContent[parentComment.id] = ""; // 清空输入框内容
      replyBoxVisible[parentComment.id] = false; // 提交后隐藏输入框
    }
  }

  function toggleReplyBox(comment) {
    replyBoxVisible[comment.id] = !replyBoxVisible[comment.id]; // 切换输入框的显示状态
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
    {user_id}
    {toggleReplyBox}
    {startReply}
    {deleteComment}
    comment={comment}
  />
      <!-- <div class="comment-item" style="margin-left: {comment.layer * 24}px">
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
          {#each comment.children as childComment}
            <div class="comment-item" style="margin-left: 24px">
              <div class="comment-content">
                <p>{childComment.content}</p>
                <div class="comment-actions">
                  <button on:click={() => toggleReplyBox(childComment)}>Reply</button>
                  <button on:click={() => deleteComment(childComment.id)}>❌ Delete</button>
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
                {#if childComment.children?.length}
                {#each childComment.children as grandchildComment}
                  <div class="comment-item" style="margin-left: 48px">
                    <div class="comment-content">
                      <p>{grandchildComment.content}</p>
                      <div class="comment-actions">
                        <button on:click={() => toggleReplyBox(grandchildComment)}>Reply</button>
                        <button on:click={() => deleteComment(grandchildComment.id)}>❌ Delete</button>
                      </div>
                     
                      {#if replyBoxVisible[grandchildComment.id]}
                        <div class="reply-box">
                          <input
                            type="text"
                            bind:value={replyContent[grandchildComment.id]}
                            placeholder="Write a reply..."
                          />
                          <button on:click={() => startReply(grandchildComment)}>Post</button>
                        </div>
                      {/if}
                    </div>
                  </div>
                {/each}
                {/if}
              </div>
            </div>
          {/each}
        {/if}

      </div> -->
    {/each}
  </div>
</div>

<style>
  .comments-container {
    max-width: 800px;
    margin: 0 auto;
  }

  /* .comment-item {
    border-left: 2px solid #e1e1e1;
    margin: 12px 0;
    padding: 8px 0 8px 12px;
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
  } */

  .comment-box {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 10px;
  }

  .comment-btn {
    background: blue;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
  }

  .comment-btn:disabled {
    background: gray;
    cursor: not-allowed;
  }
</style>