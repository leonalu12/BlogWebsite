<script>
  import { User, Settings, LogOut } from "lucide-svelte";
  import UserEdit from "./UserEdit.svelte";
  import UserLogin from "./UserLogin.svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  let isOpen = false;
  let displayEdit = false;
  let displayLogin = false;

  function toggleDisplayLogin() {
    displayLogin = !displayLogin;
  }

  function toggleDisplayEdit() {
    displayEdit = !displayEdit;
    toggleDropdown();
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  async function userLogOut() {
    const response = await fetch(`${PUBLIC_API_BASE_URL}/auth`, {
      method: "delete",
      credentials: "include"
    });
    console.log("log out response:", response);
    logedIn.set(false);
    toggleDropdown();
    toggleDisplayLogin();
  }
</script>

{#if !$logedIn}
  <button on:click={toggleDisplayLogin}><User /></button>
  {#if displayLogin}
    <UserLogin />
  {/if}
{:else}
  <div class="dropdown">
    <button on:click={toggleDropdown}><User /></button>
    <div class="dropdown-content" style="display: {isOpen ? 'block' : 'none'};">
      <button on:click={toggleDisplayEdit} class="editButton"><User /> Profile</button>

      <button on:click={userLogOut} class="editButton"><LogOut /> Log out</button>
    </div>
  </div>
  {#if displayEdit}
    <UserEdit />
  {/if}
{/if}

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1; /*layer on top of everything*/
  }

  .editButton {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .editButton:hover {
    background-color: #f1f1f1;
  }
</style>
