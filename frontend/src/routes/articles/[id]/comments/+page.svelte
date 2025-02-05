<script>
    export let data;
    const { comments } = data;

    let comment = "";
  let commentslist = [];

  function submitComment() {
    if (!comment.trim()) return;
    commentslist = [...commentslist, comment];
    comment = "";
  }
</script>

<p>testing</p>

<input
  class="comment-box"
  type="text"
  bind:value={comment}
  placeholder="your comment here..."
  on:keypress={(e) => e.key === 'Enter' && submitComment()}
/>
<button class="comment-btn" on:click={submitComment} disabled={!comment.trim()}>post</button>

<ul>
  {#each commentslist as c}
    <li>{c}</li>
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