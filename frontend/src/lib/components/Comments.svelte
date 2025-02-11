<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import CommentItem from "./CommentItem.svelte";
  import { PUBLIC_API_BASE_URL} from "$env/static/public";
  import { displayLogin } from "../store/userStore";
  export let article;
  let article_id = article.id;
  export let user = writable(null);
  const comments = writable([]);

  let user_id = null; // 设定默认值
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
  const commentMap = new Map(); // store all the comments
  const rootComments = [];

  // First pass: initialize comments and map
    commentsArray.forEach(comment => {
    comment.children = []; // Initialize children array
    commentMap.set(comment.id, comment);});

  // Second pass: build tree structure
  commentsArray.forEach(comment => {
    if (comment.parent_cid) {
      let parentComment = commentMap.get(comment.parent_cid);
        if (!parentComment) {
          // 如果找不到父评论，作为根评论处理
          rootComments.push(comment);
          return;
        }
      // 找到要插入的目标评论（实际显示位置的父评论）
      let targetParent = parentComment;
      if (parentComment.layer >= 3) {
        // 如果父评论层级已经是3或以上，往上找到第二层的祖先评论
        let ancestor = parentComment;
        while (ancestor.parent_cid && ancestor.layer > 2) {
          ancestor = commentMap.get(ancestor.parent_cid);
        }
        targetParent = ancestor;
      }

      // 保持原始 layer 值，但在显示时放在第三层
      comment.displayLayer = targetParent.layer >= 2 ? 3 : targetParent.layer + 1;
      
      // 将评论添加到目标父评论的 children 中
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
      const newCommentData = await res.json(); // 获取新评论数据
      comments.update(current => {
      let flatComments = [];
      
      // 递归遍历树，将所有评论存入 `flatComments`
      function flattenTree(commentsArray) {
        for (let comment of commentsArray) {
          flatComments.push(comment);
          if (comment.children && comment.children.length > 0) {
            flattenTree(comment.children);
          }
        }
      }
      flattenTree($comments); // 先把现有的树转换成列表

      flatComments.push(newCommentData); // 添加新评论

      return buildCommentTree(flatComments); // 重新构建树结构
    });
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
      credentials: "include",
      body: JSON.stringify({
        content,
        layer: parentComment.layer + 1, 
        date_time: new Date().toLocaleString(),
        user_id, 
        article_id: article_id,
        parent_cid: parentComment.id, // 关联父级评论
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
      replyContent[parentComment.id] = ""; // 清空输入框内容
      replyBoxVisible[parentComment.id] = false; // 提交后隐藏输入框
    }
  }

  function toggleReplyBox(comment) {
    if (!$user) {
      displayLogin.set(true);
      return;
    }
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