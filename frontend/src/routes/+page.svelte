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
 .articles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* 自适应列 */
  gap: 20px;
  padding: 20px;
  justify-content: center;
}

.article {
  height: auto;
  width: 100%; 
  max-width: 350px; 
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: white;
  transition: transform 0.3s ease-in-out;
}

.article:hover {
  transform: translateY(-5px);
}

img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
}

.article div {
  padding: 10px;
  font-size: 14px;
  line-height: 1.4;
}

</style>
