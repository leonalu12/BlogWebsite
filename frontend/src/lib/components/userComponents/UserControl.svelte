<script>
  import { onMount, onDestroy } from "svelte";
  import { User, Settings, LogOut, Menu } from "lucide-svelte";
  import UserEdit from "./UserEdit.svelte";
  import UserLogin from "./UserLogin.svelte";
  import UserSecurity from "./UserSecurity.svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL, PUBLIC_IMAGES_URL } from "$env/static/public";
  import AlertWindow from "../utils/AlertWindow.svelte";
  import { displayEdit, displaySecurity, displayEditSuccessAlert, displayChangePwdAlert, deleteUserSuccess, displayLogin, iconName } from "../../store/userStore.js";
  import { goto } from "$app/navigation";

  let showLogoutAlert = false;
  let isOpen = false;
  let dropdownRef; // 用于引用下拉框的 DOM 元素
  let triggerRef; // 用于引用触发按钮的 DOM 元素

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
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/auth`, {
        method: "DELETE",
        credentials: "include"
      });
      console.log("log out response:", response);
      logedIn.set(false);
      displayLogin.set(false);
      displayEdit.set(false);
      showLogoutAlert = true;
      toggleDropdown();
    } catch (error) {
      console.error("log out error:", error);
    }
  }

  // 点击外部关闭下拉框
  function handleClickOutside(event) {
    if (dropdownRef && !dropdownRef.contains(event.target)) {
      if (triggerRef && !triggerRef.contains(event.target)) {
        isOpen = false;
      }
    }
  }

  // 组件挂载时添加事件监听器
  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  // 组件销毁时移除事件监听器
  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

{#if !$logedIn}
  <button class="userButton" on:click={toggleDisplayLogin}>
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
    <button class="loggedIcon" on:click={toggleDropdown} bind:this={triggerRef}>
      <img class="iconImg" src="{PUBLIC_IMAGES_URL}/{$iconName}" alt="User Icon" />
    </button>
    <div class="dropdown-content" class:open={isOpen} bind:this={dropdownRef}>
      <button on:click={toggleDisplayEdit} class="dropdownButton">
        <User /> Profile
      </button>
      <button on:click={toggleDisplaySecurity} class="dropdownButton">
        <Settings /> Security
      </button>
      <button on:click={userLogOut} class="dropdownButton">
        <LogOut /> Log out
      </button>
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
    <AlertWindow message="Password changed" on:confirm={() => displayChangePwdAlert.set(false)} />
  {/if}
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

<style>
  .userButton {
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
    transition: box-shadow 0.3s ease;
  }

  .userButton:hover {
    box-shadow: 0 3px 5px rgba(182, 181, 181, 0.5);
  }

  .menu {
    width: 20px;
    height: 20px;
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

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .loggedIcon {
    background-color: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .iconImg {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #ffffff;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 1;
    border-radius: 8px;
    overflow: hidden;
    min-width: 160px;
  }

  .dropdown-content.open {
    display: block;
  }

  .dropdownButton {
    width: 100%;
    padding: 12px 16px;
    text-align: left;
    background-color: transparent;
    border: none;
    color: #343434;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .dropdownButton:hover {
    background-color: #f0f0f0;
  }
</style>