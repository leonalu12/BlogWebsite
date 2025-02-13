<script>
  import { onMount } from "svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../utils/AlertWindow.svelte";
  import { displaySecurity } from "../../store/userStore.js";
  import { displayChangePwdAlert } from "../../store/userStore.js";
  import DeleteComfirmWindow from "../utils/DeleteConfirmWindow.svelte";
  import { goto } from "$app/navigation";
  import { deleteUserSuccess } from "../../store/userStore.js";
  import { displayLogin } from "../../store/userStore.js";

  let username = "";
  let newPwd = "";
  let confirmPwd = "";
  let loading = true;
  let showPwdNotMatch = false;
  let currentPwd = "";
  let showCurrentPwdNotCorrect = false;
  let comfirmDeleteUser = false;
  let displayUserPopUpwindow = true;

  function closeUserPopUpwindow() {
    displayUserPopUpwindow = false;
    displaySecurity.set(false);
  }

  $: user = {
    username: username,
    pwd: newPwd
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
    if (newPwd !== confirmPwd) {
      showPwdNotMatch = true;
      return;
    }

    try {
      const verifyResponse = await fetch(`${PUBLIC_API_BASE_URL}/users/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ password: currentPwd })
      });

      if (!verifyResponse.ok) {
        throw new Error("change failed");
      } else {
        const data = await verifyResponse.json();
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
      } else {
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

  function toggleDisplayDeleteUserWindow() {
    comfirmDeleteUser = !comfirmDeleteUser;
  }

  async function deleteUser() {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      console.log("delete user response:", response);
    } catch (error) {
      console.error("delete user error:", error);
    }

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/auth`, {
        method: "DELETE",
        credentials: "include"
      });
      console.log("log out response:", response);
      deleteUserSuccess.set(true);
      logedIn.set(false);
      displaySecurity.set(false);
      displayLogin.set(false);
    } catch (error) {
      console.error("log out error:", error);
    }
  }
</script>

{#if displayUserPopUpwindow}
  <button class="overlay" on:click={closeUserPopUpwindow}>
    <button on:click|stopPropagation style="background-color: transparent; border: none;">
      <div class="security-container">
        <div class="security-header">
          <p class="SecurityTitle">Security</p>
          <button class="deleteUserBtn" on:click={toggleDisplayDeleteUserWindow}>delete user</button>
          {#if comfirmDeleteUser}
            <DeleteComfirmWindow
              message="Are you sure to delete this user?"
              on:confirm={deleteUser}
              on:cancel={toggleDisplayDeleteUserWindow}
            />
          {/if}
        </div>
        {#if loading}
          <p>loading...</p>
        {:else}
          <form on:submit={handleSubmit}>

            
            <div class="userInput">

              <div class="changeName-header">
                <p class="changeNameTitle">change password</p>
              <div class="form-group input-container">
                <input type="password" id="pwd" bind:value={currentPwd} placeholder=" " required />
                <label for="pwd">current password</label>
              </div>
              <div class="form-group input-container">
                <input type="password" id="newPwd" bind:value={newPwd} placeholder=" " required />
                <label for="newPwd">new password</label>
              </div>
              <div class="form-group input-container passwordConfirm-container">
                <div>
                  <input
                    type="password"
                    id="confirmPwd"
                    bind:value={confirmPwd}
                    placeholder=" "
                    required
                  />
                  <label for="confirmPwd">confirm password</label>
                </div>
                {#if newPwd && confirmPwd}
                  {#if newPwd !== confirmPwd}
                    <span class="password-error">passwords do not match</span>
                  {/if}
                {/if}
              </div>

              
            </div>
            <div class="form-group">
                <button type="submit" class="securityBtn">submit</button>
              </div>
          </form>
          
        {/if}
      </div>
    </button>
  </button>
{/if}

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
    z-index: 1000; /* make sure it's on top of everything */
  }

  .security-container {
    width: 40%; /* Adjusted width */
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: lightpink;
    transition: background 5s ease;
    opacity: 0.9;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    text-align: left;
    display: flex;
    flex-direction: column;
  }

  .security-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .SecurityTitle {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: "Arial", sans-serif;
    text-align: center;
    flex-grow: 1;
  }

  .changeNameTitle {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: "Arial", sans-serif;
    text-align: center;
    border-bottom: #9c9b9b 1px solid;
    padding-bottom: 10px;
    margin: 0;
    width: 97%;
    justify-self: center;
    margin-bottom: 20px;
  }

  .userInput {
    border-radius: 10px;
    position: relative;
    margin: 0;
    padding: 0;
    outline: rgb(130, 130, 130) 1px solid;
    padding-top: 17px;
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

  .input-container {
    position: relative;
  }

  .input-container label {
    top: 2px;
    left: 10px;
    transition: all 0.3s;
    color: #575656;
    position: absolute;
    font-size: 17px;
  }

  .input-container input:focus + label,
  .input-container input:not(:placeholder-shown) + label {
    top: -10px;
    font-size: 15px;
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 16px;
    color: #000;
    background-color: transparent;
    margin-top: 3px;
    margin-bottom: 0;
  }

  .securityBtn {
    border: none;
    border-radius: 10px;
    cursor: pointer;
    padding: 10px;
    background: linear-gradient(90deg, pink, #ffe4e1);
    transition: transform 0.2s ease;
    height: 50px;
    font-size: 16px;
    opacity: 1;
    width: 100%;
    display: block;
    margin: 0 auto;
  }

  .securityBtn:hover {
    transform: translateY(-3px);
  }

  .deleteUserBtn {
    position: absolute;
    right: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 10px;
    background: linear-gradient(90deg, pink, #ffe4e1);
    transition: transform 0.2s ease;
    height: 40px;
    font-size: 12px;
    opacity: 1;
  }

  .deleteUserBtn:hover {
    transform: translateY(-3px);
  }

  .password-error {
    color: rgba(248, 86, 86, 0.758);
    font-size: 14px;
    white-space: nowrap;
    margin-bottom: 14px;
  }

  .passwordConfirm-container {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
</style>
