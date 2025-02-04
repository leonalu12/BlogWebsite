<script>
  import "$lib/css/app.css";

  import { page } from "$app/stores";
  $: path = $page.url.pathname;
</script>


<div>
  <div>
    <nav>
      <span>
        <a href="/">Home</a>
      </span>
    
      <span class="nav-links">
        <a href="/" class:active={path === "/"}>Explore</a>
        <a href="/" class:active={path === "/"}>ME</a>
      </span>
    
      <span>
        <a href="/">icon</a>
      </span>
    </nav>
  </div>

  <dir>
    <nav>
    <span><a href="/" class:active={path === "/"}>Explore</a></span>
    <span><a href="/" class:active={path === "/"}>Explore</a></span>
    <span><a href="/" class:active={path === "/"}>Explore</a></span>
    </nav>
  </dir>
</div>


<div class="container">
  <slot />
</div>


<style>
  nav {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background-color: #f0f0f0;
  }

  nav a {
    text-decoration: none;
    color: #333;
  }

  nav a.active {
    color: #0070f3;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  
</style>