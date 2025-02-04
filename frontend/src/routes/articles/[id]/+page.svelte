<script>
    import { PUBLIC_IMAGES_URL } from "$env/static/public";
    export let data;
    const { article } = data;

</script>

<svelte:head>
    <title>Article</title>  
</svelte:head>


<h1>Article</h1>

<div>
    <div>
        <img src={`${PUBLIC_IMAGES_URL}/Dragonite.png`} alt="Dragonite">
    </div>
    <div>
        <h2>{article.title}</h2>
        <p>{article.content}</p>
    </div>
</div>