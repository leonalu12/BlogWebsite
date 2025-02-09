<script>
  import { User, Settings, LogOut, Menu } from "lucide-svelte";
  import UserEdit from "./UserEdit.svelte";
  import UserLogin from "./UserLogin.svelte";
  import UserSecurity from "./UserSecurity.svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL} from "$env/static/public";
  import AlertWindow from "../utils/AlertWindow.svelte";
  import { displayEdit } from "../../store/userStore.js";
  import { displaySecurity } from "../../store/userStore.js";
  import { displayEditSuccessAlert } from "../../store/userStore.js";
  import { displayChangePwdAlert } from "../../store/userStore.js";
  import { deleteUserSuccess } from "../../store/userStore.js";
  import { goto } from "$app/navigation";
  import { displayLogin } from "../../store/userStore.js";
  import { PUBLIC_IMAGES_URL} from "$env/static/public";
  import { iconName } from "../../store/userStore.js";

  

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
    displayLogin.set(false);
    logedIn.set(false);
    displayEdit.set(false);
    showLogoutAlert = true;
  }
</script>

{#if !$logedIn}

  <button class="userBUtton" on:click={toggleDisplayLogin}> 
    <span class="menu"><Menu /></span>
    <span class="icon"><User /></span>
    
  </button>
  {#if $displayLogin}
    <UserLogin />
  {/if}
  {#if showLogoutAlert}
    <AlertWindow message="Log out successfully" on:confirm={() => (showLogoutAlert = false)} />
  {/if}
{:else}
  <div class="dropdown">
    <button class="logedIcon" on:click={toggleDropdown}> <img class="iconImg" src="{ PUBLIC_IMAGES_URL}/{ $iconName }" alt="no img"> </button>
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

  .userBUtton {
    background-color: transparent;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e7e4e4;
    border-radius: 30px;
    padding: 7px 12px;
    gap: 13px;
  }
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

  .menu {
    width: 16px;
    height: 16px;
    color: #343434;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
    
  .icon {
    width: 30.6px;
    height: 30.6px;
    border-radius: 50%;
    background-color: #929292;
    color: #fff;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logedIcon {
    background-color: transparent;
      border: none; 
      padding: 0; 
      cursor: pointer;
  }
  .iconImg {
    margin: 0;
    padding: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .userBUtton:hover {
    outline: transparent;
    box-shadow: 0 3px 5px #b6b5b5;

  }
</style>
