<script>
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  export let data;
  const { articles } = data;
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<h1>home page test</h1>



<h2>Articles</h2>
<div class="articles">
  {#each articles as article}
    <span class="article">
      <a href={`/articles/${article.id}`}>
        <div>
          <div><img src={`${PUBLIC_IMAGES_URL}/Dragonite.png`} alt="Dragonite"></div>
          <div> {article.title}</div>
          <div> {article.content}</div>
        </div>
      </a>
    </span>
  {/each}

</div>


<style>
  .article {
    height: 400px;
    width: 250px;
    border: 1px solid black;
    margin: 10px;
    border-radius: 10px;
  }

  .articles {
    display: flex;
  }

  img {
    width: 200px;
    height: 300px;
    object-fit: cover;
  }

</style>

