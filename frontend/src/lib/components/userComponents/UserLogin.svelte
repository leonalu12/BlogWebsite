<script>
  import { onMount } from "svelte";
  import UserRegister from "./UserRegister.svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { logedIn } from "../../store/userStore.js";
  import AlertWindow from "../utils/AlertWindow.svelte"; //import the alertWindow component
  import { displayEdit } from "../../store/userStore.js";
  import { iconName } from "../../store/userStore.js";
  import { displayLogin } from "../../store/userStore.js";


  let displayRegister = false;
  let displayloginFailed = false;
  let displayUserPopUpwindow = true;

  function closeUserPopUpwindow() {
    displayUserPopUpwindow=false;
    displayLogin.set(false);
  }

  function toggleLogedIn() {
    logedIn.update((value) => !value);
    closeUserPopUpwindow();
  }
  function toggleRegister() {
    displayRegister = !displayRegister;
  }
  let username = "";
  let password = "";

  // process the login form
  async function handleLogin(event) {
    event.preventDefault();

    // send the login request
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error("login failed");
      } else {
        const data = await response.json();
        console.log("登录成功:", data);
        toggleLogedIn();
        displayloginFailed = false;
        try {
          const response = await fetch(`${PUBLIC_API_BASE_URL}/users/icon`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include"
          });
          if (!response.ok) {
            throw new Error("获取用户头像失败");
          } else {
            const data = await response.json();
            iconName.set(data);
            console.log("获取用户头像成功:", data);
          }
        } catch (error) {
          console.error("获取用户头像失败:", error);
        }
      }

      // redirect to the home page
    } catch (error) {
      displayloginFailed = true;
      console.error("登录失败:", error);
    }
  }
</script>
{#if displayUserPopUpwindow}
<button class="overlay" on:click={closeUserPopUpwindow}  >
  <button on:click|stopPropagation>
  {#if displayloginFailed}
    <AlertWindow message="login failed" on:confirm={() => (displayloginFailed = false)} />
    <!-- pass the message prop to the alertWindow component -->
  {/if}

  {#if !$logedIn}
    {#if displayRegister}
      <UserRegister />
    {:else}
    
      <div class="login-container">
        <h2>login</h2>
        <form on:submit={handleLogin}>
          <div class="form-group">
            <label for="username">username</label>
            <input type="text" id="username" bind:value={username} required />
          </div>
          <div class="form-group">
            <label for="password">password</label>
            <input type="password" id="password" bind:value={password} required />
          </div>
          <div>
            <button type="button" on:click={toggleRegister}>Hey, register one?</button>
          </div>
          <div class="form-group">
            <button type="submit">login</button>
          </div>
        </form>
      </div>
      {/if}
  {/if}
  </button>
</button>
{/if}


<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5); /* half transparent */
    z-index: 10; /* make sure it's on top of everything */
  }
  .login-container {
    width: 300px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 11;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
  }

  .form-group input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }

  .form-group button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .form-group button:hover {
    background-color: #0056b3;
  }
</style>
