<script>
    import "$lib/css/app.css";
    import AddButton from "$lib/components/AddButton.svelte";
  
    import { page } from "$app/stores";
    $: path = $page.url.pathname;
  </script>
<AddButton />
<div class="article-nav">
    <span>Article</span>
    <span><button>like</button></span>
</div>

<slot />


<style>
    .article-nav {
        display: flex;
        justify-content: space-between;
        padding: 1rem;
    }

    .article-nav button {
        background-color: #0070f3;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 0.5rem 1rem;
    }
</style>