<script>
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    export let data;
    let comments = writable(data.comments);

import {page} from '$app/stores';
export function load({params}){
  const {id} = params;
  return {id};
}
$: article_id = $page.params.id;
    let content = "";
    let user_id =1;//need to change!

    


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
        body: JSON.stringify(newComment)
  });
  if (res.ok) {
        const newCommentData = await res.json(); // 获取新评论数据
        comments.update(current => [...current, newCommentData]);
    content = ""; // 清空输入框

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
      body: JSON.stringify({
        content,
        layer: parentComment.layer + 1 > 3 ? 3 : parentComment.layer + 1, // 最多 3 层
        date_time: new Date().toISOString(),
        user_id: 1, // 这里需要改成你的用户ID
        article_id: article_id,
        parent_cid: parentComment.id, // 关联父级评论
      })
    });

    if (res.ok) {
      const newComment = await res.json();
      comments.update(current => [...current, newComment]);
      replyContent[parentComment.id] = ""; // 清空输入框内容
      replyBoxVisible[parentComment.id] = false; // 提交后隐藏输入框
    }
  }

  function toggleReplyBox(comment) {
    replyBoxVisible[comment.id] = !replyBoxVisible[comment.id]; // 切换输入框的显示状态
  }

onMount(data);
</script>

<p>testing</p>

<input
  class="comment-box"
  type="text"
  bind:value={content}
  placeholder="your comment here..."
  on:keypress={(e) => e.key === 'Enter' && addComment()}
/>
<button class="comment-btn" on:click={addComment} disabled={!content.trim()}>post</button>


<!-- 显示评论列表 -->
<ul>
  <!-- literate every comment -->
  {#each $comments as c}  
    <li style="margin-left: {c.layer * 20}px;">
      {c.content}
      <button class="reply-btn" on:click={() => toggleReplyBox(c)}>Reply</button>
            <!-- 回复输入框 -->
            {#if replyBoxVisible[c.id]}
            <div class="reply-box">
              <input
                type="text"
                bind:value={replyContent[c.id]}
                placeholder="Write a reply..."
              />
              <button on:click={() => startReply(c)}>Post</button>
            </div>
          {/if}
    </li>
  {/each}
</ul>

<style>
    .comment-box {
      width: 300px;
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