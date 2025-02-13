<script>
  import "$lib/css/app.css";
  import UserControl from "$lib/components/userComponents/UserControl.svelte";
  import AddButton from "$lib/components/AddButton.svelte";
  import { page } from "$app/stores";
  import UserLogin from "../lib/components/userComponents/UserLogin.svelte";
  import UserEdit from "../lib/components/userComponents/UserEdit.svelte";
  import UserSecurity from "../lib/components/userComponents/UserSecurity.svelte";
  import AlertWindow from "../lib/components/utils/AlertWindow.svelte";
  import { logedIn } from "../lib/store/userStore";
  import { displayLogin } from "../lib/store/userStore";
  import { displayLogoutSuccess } from "../lib/store/userStore";
  import { displayEdit } from "../lib/store/userStore";
  import { displaySecurity } from "../lib/store/userStore";
  import { displayEditSuccessAlert } from "../lib/store/userStore";
  import { displayChangePwdAlert } from "../lib/store/userStore";
  import { deleteUserSuccess } from "../lib/store/userStore";
  import { goto } from "$app/navigation";

  $: path = $page.url.pathname;
  $: isEditPage = path.includes('edit');
</script>

<div class="page">
  <div class="page-container">
    <div class="header">
      <nav>
        <span class="nav-links">
          <a href="/" class:active={path === "/"} class="nav-option">Explore</a>
          <a href="/articles/new" class:active={path === "/articles/new"} class="nav-option">New</a>
        </span>

        <span class="search-container-nav">
          <slot name="search" />
        </span>

        <span class="user-control nav-links">
          <a href="/myArticles" class:active={path === "/myArticles"} class="nav-option">ME</a>

          <UserControl />
        </span>
      </nav>
    </div>

    <div class="content">
      <slot />
    </div>
  </div>

  {#if !isEditPage}
    <div class="add-button-container">
      <AddButton />
    </div>
  {/if}

  {#if !$logedIn}
    {#if $displayLogin}
      <UserLogin />
    {/if}
  {/if}

  {#if $displayEdit}
    <UserEdit />
  {/if}

  {#if $displaySecurity}
    <UserSecurity />
  {/if}

  {#if $displayLogoutSuccess}
    <AlertWindow
      message="Log out successfully"
      on:confirm={() => displayLogoutSuccess.set(false)}
    />
  {/if}

  {#if $displayEditSuccessAlert}
    <AlertWindow
      message="User Information Updated"
      on:confirm={() => displayEditSuccessAlert.set(false)}
    />
  {/if}

  {#if $displayLogoutSuccess}
    <AlertWindow
      message="Log out successfully"
      on:confirm={() => displayLogoutSuccess.set(false)}
    />
  {/if}

  {#if $displayChangePwdAlert}
    <AlertWindow message="Password changed" on:confirm={() => displayChangePwdAlert.set(false)} />
  {/if}

  {#if $deleteUserSuccess}
    <AlertWindow
      message="User deleted"
      on:confirm={() => {
        displayEdit.set(false);
        displaySecurity.set(false);
        logedIn.set(false);
        deleteUserSuccess.set(false);
        goto("/");
      }}
    />
  {/if}
</div>

<style>
  :global(body) {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  :global(body::-webkit-scrollbar) {
    display: none; /* Chrome, Safari, Opera */
  }
  .page-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff5f5;
  }

  .header {
    background: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 30;
  }

  nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 20;
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
    margin: 40px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .add-button-container {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    opacity: 95%;
  }

  :global(.add-button) {
    background: linear-gradient(90deg, pink, #ffe4e1);
    border: none;
    border-radius: 25px;
    padding: 12px 30px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  :global(.add-button:hover) {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
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

  .user-control {
    z-index: 51;
  }

  @media (max-width: 1080px) {
    nav{
      z-index: 1000;
    }
    
  }
</style>
