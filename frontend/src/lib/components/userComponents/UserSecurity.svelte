<script>
  import { onMount } from "svelte";
  import {  logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../utils/alertWindow.svelte";
  import { displaySecurity } from "../../store/userStore.js"; //import the alertWindow component
  import { displayChangePwdAlert } from "../../store/userStore.js";

  let username = "";

  let newPwd = "";
  let confirmPwd = "";
  let loading = true;
  let showPwdNotMatch = false;
  let currentPwd = "";
  let showCurrentPwdNotCorrect = false;
  $: user = {
    username: username,
    pwd: newPwd,
  };

  // get data when the component is mounted
  onMount(async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/`, {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("network response problem");
      }
      const data = await response.json();
    
      username = data.username;
      console.log("Username:", username);
    } catch (error) {
      console.error("network:", error);
    } finally {
      loading = false;
    }
  });

  // process the form on submit
  async function handleSubmit(event) {
    event.preventDefault();
    console.log("User Information:", user);
    //can not submit if new password and confirm password do not match
    if (newPwd !== confirmPwd) {
      showPwdNotMatch = true;
      return;
    }

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ password: currentPwd })
      });

      if (!response.status === 200) {
        throw new Error("change failed");
      } else {
        const data = await response.json();
        console.log("current password matched:", data);
      }
    } catch (error) {
      showCurrentPwdNotCorrect = true;
      console.error("change failed", error);
      return;
    }
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(user),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("network response problem");
      }else{
        displayChangePwdAlert.set(true);
        showPwdNotMatch = false;
        showCurrentPwdNotCorrect = false;
        displaySecurity.set(false);
        console.log("password changed");
      }
    } catch (error) {
      console.error("network:", error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="form-container">
  <h2>change password</h2>
  {#if loading}
    <p>loading...</p>
  {:else}
    <form on:submit={handleSubmit}>
      <div class="form-group">
        <label for="pwd">password</label>
        <input type="password" id="pwd" bind:value={currentPwd} required />
      </div>
      <div>
        <div class="form-group">
          <label for="newPwd">new password</label>
          <input type="password" id="newPwd" bind:value={newPwd} required />
        </div>
        <div class="form-group">
          <label for="confirmPwd">confirm password</label>
          <input type="password" id="confirmPwd" bind:value={confirmPwd} required />
          <div class="form-group">
            {#if newPwd && confirmPwd}
              {#if newPwd !== confirmPwd}
                <p style="color: red;">passwords do not match</p>
              {/if}
            {/if}
            <button type="submit">submit</button>
          </div>
        </div>
      </div>
    </form>
  {/if}
</div>

{#if showPwdNotMatch}
  <AlertWindow message="passwords do not match" on:confirm={() => (showPwdNotMatch = false)} />
{/if}
{#if showCurrentPwdNotCorrect}
  <AlertWindow
    message="current password is not correct"
    on:confirm={() => (showCurrentPwdNotCorrect = false)}
  />
{/if}

<style>
  .form-container {
    width: 65%;
    height: 70%;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
