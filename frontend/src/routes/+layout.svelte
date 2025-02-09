<script>
  import "$lib/css/app.css";
  import UserControl from "$lib/components/userComponents/UserControl.svelte";
  import AddButton from "$lib/components/AddButton.svelte";
  import { page } from "$app/stores";
  import { Menu } from "lucide-svelte";

  $: path = $page.url.pathname;
</script>

<div>
  <div class="nav-container">
    <nav>
      <span class="nav-links">
        <a href="/" class="home-link">Home</a>
      </span>

      <span class="nav-links">
        <a href="/" class:active={path === "/"} class="nav-option">Explore</a>
        <a href="/myArticles" class:active={path === "/myArticles"} class="nav-option">ME</a>
      </span>

      <span class="user-control nav-links">
        <UserControl />
      </span>
    </nav>
  </div>
</div>
<AddButton />

<div class="container">
  <slot />
</div>

<style>
  .home-link {
    font-family:
      Circular,
      -apple-system,
      BlinkMacSystemFont,
      Roboto,
      "Helvetica Neue",
      sans-serif;
    font-size: 1.15rem;
    line-height: 1.6;
    color: #ff385c;
    text-decoration: none;
    padding: 8px;
  }

  .nav-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-inline: auto;
    z-index: 1;
    height: 100%;
    border-bottom: 1px solid #f7f7f7;
  }

  nav {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background-color: #ffffff;
  }
  .nav-option {
    font-family:
      Circular,
      -apple-system,
      BlinkMacSystemFont,
      Roboto,
      "Helvetica Neue",
      sans-serif;
    font-size: 1rem;
    line-height: 1.43;
    color: #929292;
    text-decoration: none;
    padding: 7px 20px;
    border-radius: 50px;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .user-control {
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    z-index: 2;
  }

  nav a {
    font-family:
      Circular,
      -apple-system,
      BlinkMacSystemFont,
      Roboto,
      "Helvetica Neue",
      sans-serif;
    font-size: 0.875rem;
    line-height: 1.43;
    color: #222222;
    text-decoration: none;
  }

  nav a:hover {
    color: #000000;
    background-color: #f7f7f7;
    border-radius: 50px;
  }

  nav a.active {
    color: black;
  }
  nav a.active:hover {
    background-color:transparent;
    border-radius: 0;
  }

  .home-link:hover {
    color: #c90428;
    background-color: transparent;
    border-radius: 0;
  }
</style>
