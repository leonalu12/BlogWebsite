<script>

  import "$lib/css/app.css";
  import UserControl from "$lib/components/userComponents/UserControl.svelte";
  import AddButton from "$lib/components/AddButton.svelte";
  import { page } from "$app/stores";

  $: path = $page.url.pathname;

</script>

<div class="page-container">
  <div class="header">
    <nav>
      <span class="nav-links">
        <a href="/" class:active={path === "/"} class="nav-option">Explore</a>
        <a href="/myArticles" class:active={path === "/myArticles"} class="nav-option">ME</a>
      </span>

      <span class="search-container-nav">
        <slot name="search" />
      </span>

      <span class="user-control nav-links">
        <UserControl />
      </span>
    </nav>
  </div>
  
  <div class="content">
    <slot />
  </div>
</div>

<div class="add-button-container">
  <AddButton />
</div>


<style>
  .page-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff5f5;
  }

  .header {
    background: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
  
  }

  nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-links {
    display: flex;
    gap: 20px;
    align-items: center;
    z-index: 19;
  }

  .nav-option {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .nav-option:hover {
    background: rgba(255, 182, 193, 0.2);
  }

  .nav-option.active {
    background: lightpink;
    color: white;
  }

  .content {
    flex: 1;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;

  }

  .add-button-container {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    
  }

  :global(.add-button) {
    background: linear-gradient(90deg, pink, #FFE4E1);
    border: none;
    border-radius: 25px;
    padding: 12px 30px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  :global(.add-button:hover) {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    .nav-links {
      gap: 10px;
    }

    .nav-option {
      padding: 6px 12px;
      font-size: 14px;
    }

    .content {
      padding: 10px;
    }
  }

  .search-container-nav {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    z-index: 19;

  }

  .user-control{
    z-index: 51;
  }
  
</style>