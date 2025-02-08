<script>
  import { User, Settings, LogOut, GhostIcon } from "lucide-svelte";
  import UserEdit from "./UserEdit.svelte";
  import UserLogin from "./UserLogin.svelte";
  import UserSecurity from "./UserSecurity.svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../utils/AlertWindow.svelte";
  import { displayEdit } from "../../store/userStore.js";
  import { displaySecurity } from "../../store/userStore.js";
  import { displayEditSuccessAlert } from "../../store/userStore.js";
  import { displayChangePwdAlert } from "../../store/userStore.js";
  import { deleteUserSuccess } from "../../store/userStore.js";
  import { goto } from "$app/navigation";
  import { displayLogin } from "../../store/userStore.js";

  let showLogoutAlert = false;
  let isOpen = false;

  function toggleDisplaySecurity() {
    displaySecurity.update((value) => !value);
    displayEdit.set(false);
    toggleDropdown();
  }

  function toggleDisplayLogin() {
    displayLogin.update((value) => !value);
    displayEdit.set(false);
  }

  function toggleDisplayEdit() {
    displayEdit.update((value) => !value);
    displaySecurity.set(false);
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
    displayLogin.set
    logedIn.set(false);
    displayEdit.set(false);
    showLogoutAlert = true;
  }
</script>

{#if !$logedIn}
  <button on:click={toggleDisplayLogin}><User /></button>
  {#if $displayLogin}
    <UserLogin />
  {/if}
  {#if showLogoutAlert}
    <AlertWindow message="Log out successfully" on:confirm={() => (showLogoutAlert = false)} />
  {/if}
{:else}
  <div class="dropdown">
    <button on:click={toggleDropdown}><User /></button>
    <div class="dropdown-content" style="display: {isOpen ? 'block' : 'none'};">
      <button on:click={toggleDisplayEdit} class="editButton"><User /> Profile</button>
      <button on:click={toggleDisplaySecurity} class="editButton"><User /> security</button>
      <button on:click={userLogOut} class="editButton"><LogOut /> Log out</button>
    </div>
  </div>

  {#if $displaySecurity}
    <UserSecurity />
  {/if}

  {#if $displayEdit}
    <UserEdit />
  {/if}

  {#if $displayEditSuccessAlert}
    <AlertWindow
      message="User Information Updated"
      on:confirm={() => displayEditSuccessAlert.set(false)}
    />
  {/if}

  {#if $displayChangePwdAlert}
    <AlertWindow message="password changed" on:confirm={() => displayChangePwdAlert.set(false)} />
  {/if}
{/if}

{#if $deleteUserSuccess}
  <AlertWindow message="User deleted" on:confirm={() =>{
    displayEdit.set(false);
    displaySecurity.set(false);
    logedIn.set(false);
    deleteUserSuccess.set(false);
    goto("/");
  }} />
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
