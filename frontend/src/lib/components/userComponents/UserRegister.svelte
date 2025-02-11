<script>
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../utils/AlertWindow.svelte";
  import UserAvatarRegister from "./UserAvatarRegister.svelte";
  import { goto } from "$app/navigation";
  import { iconName } from "../../store/userStore.js";
  import { onMount } from "svelte";

  let user = {
    username: "",
    fname: "",
    lname: "",
    description: "",
    dob: "",
    pwd: "",
    icon: ""
  };

  let iconImage = null;
  $: logInInfo = {
    username: user.username,
    password: user.pwd
  };

  let showAvatarSelection = true;
  let selectedAvatar = null;
  let loading = false;
  let diapalyAlert = false;
  let comfirmPwd = "";
  let isUniqueUsername = true;
  let alertMessage = "";
  let displayUserPopUpwindow = true;
  let dobDisplayControl = false;

  function toggleDobDisplay() {
    dobDisplayControl = !dobDisplayControl;
  }

  function handleAvatarSelect(event) {
    const { avatar, type } = event.detail;
    selectedAvatar = avatar;
    console.log("selected avatar:", avatar);
    if (type === "predefined") {
      iconImage = avatar;
    } else {
      iconImage = avatar;
    }
  }

  function handleNext() {
    showAvatarSelection = false;
  }
  async function handleRegister(event) {
    event.preventDefault();
    loading = true;
    if (user.pwd !== comfirmPwd) {
      diapalyAlert = true;
      loading = false;
      alertMessage = "passwords do not match";
      return;
    }
    if (!isUniqueUsername) {
      loading = false;
      diapalyAlert = true;
      alertMessage = "username already exists";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("fname", user.fname);
      formData.append("lname", user.lname);
      formData.append("description", user.description);
      formData.append("dob", user.dob);
      formData.append("pwd", user.pwd);
      formData.append("icon", iconImage);

      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/register`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      console.log("注册成功:", data);
      logedIn.set(true);

      const loginResponse = await fetch(`${PUBLIC_API_BASE_URL}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(logInInfo)
      });

      if (!loginResponse.ok) {
        throw new Error("login failed");
      } else {
        const logedInData = await loginResponse.json();
        console.log("login successful:", logedInData);
        goto("/");
      }
    } catch (error) {
      console.error("注册错误:", error);
    } finally {
      loading = false;
    }
  }

  async function checkUsername() {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/checkUsernameUnique`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: user.username }),
        credentials: "include"
      });

      if (!response.ok) {
        isUniqueUsername = false;
        const error = await response.json();
        throw new Error(error.message);
      }
      isUniqueUsername = true;
      const data = await response.json();
      console.log("username checking:", data);
    } catch (error) {
      console.error("username alread existed:", error);
    }
  }
</script>

{#if showAvatarSelection}
  <UserAvatarRegister on:select={handleAvatarSelect} on:next={handleNext} />
{:else}
  <div class="register-container">
    <div class="register-header">
      <p class="RegisterTitle">Register</p>
    </div>
    <p class="welcomeMsg">Welcome to Pinkbook</p>
    <form on:submit={handleRegister}>
      <div class="userInput">
        <div class="form-group input-container">
          <input
            type="text"
            id="username"
            bind:value={user.username}
            placeholder=" "
            on:input={checkUsername}
            required
          />
          <label for="username">username</label>
        </div>
        {#if !isUniqueUsername}
          <p style="color: red;">username already exists</p>
        {/if}
        <div class="form-group input-container">
          <input type="text" id="fname" bind:value={user.fname} placeholder=" " required />
          <label for="fname">first name</label>
        </div>
        <div class="form-group input-container">
          <input type="text" id="lname" bind:value={user.lname} placeholder=" " required />
          <label for="lname">last name</label>
        </div>
        <div class="form-group input-container">
          <input type="password" id="pwd" bind:value={user.pwd} placeholder=" " required />
          <label for="pwd">password</label>
        </div>
        
        <div class="form-group input-container password-container">
          <div >
            <input type="password" id="comfirmPwd" bind:value={comfirmPwd} placeholder=" " required />
            <label for="comfirmPwd" id="comfirmPwdLabel">confirm password</label>
          </div>
          {#if user.pwd !== comfirmPwd && user.pwd && comfirmPwd}
              <span class="pwd-error">passwords do not match</span>
            {/if}
        </div>
        
       

        <div class="form-group input-container">
          {#if !dobDisplayControl}
            <input
              type="text"
              id="dob"
              bind:value={user.dob}
              on:focus={toggleDobDisplay}
              placeholder=" "
              required
            />
          {:else}
            <input type="date" id="dob" bind:value={user.dob} placeholder=" " required />
          {/if}
          <label for="dob">date of birth</label>
        </div>
        <div class="form-group input-container input-container-description">
  
            <textarea
            id="description"
            bind:value={user.description}
            placeholder=" "
            required
            ></textarea>
            <label for="description">description</label>
        </div>
      </div>
      <div class="form-group">
        <button type="submit" class="registerBtn">finish</button>
      </div>
    </form>
  </div>

  {#if diapalyAlert}
    <AlertWindow message={alertMessage} on:confirm={() => (diapalyAlert = false)} />
  {/if}

  {#if loading}
    <div class="loading-overlay">
      <div class="loading-content">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p>loading...</p>
      </div>
    </div>
  {/if}
{/if}

<style>
  .register-container {
    width: 60%;
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
    z-index: 11;
    text-align: left;
    display: flex;
    flex-direction: column;
  }

  .RegisterTitle {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: "Arial", sans-serif;
    text-align: center;
    border-bottom: #9c9b9b 1px solid;
    padding-bottom: 10px;
    margin: 0;
  }

  .welcomeMsg {
    font-size: 23px;
    font-weight: bold;
    margin: 40px 0px;
    text-align: left;
    font-family: "Arial", sans-serif;
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
    border-bottom: 1px solid #aaa;
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

  .input-container textarea:focus + label,
  .input-container textarea:not(:placeholder-shown) + label {
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
  textarea {
    width: 100%;
    border: none;
    outline: none;
    font-size: 16px;
    color: #000;
    background-color: transparent;
    margin-top: 3px;
    margin-bottom: 0;
  }

  .registerBtn {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 10px;
    background: linear-gradient(90deg, pink, #ffe4e1);
    transition: background 5s ease;
    height: 50px;
    font-size: 16px;
    opacity: 1;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
  }

  .loading-content p {
    margin-left: 10px;
  }

  .input-container-description {
    border-bottom: none;
  }

  #comfirmPwd{
    display: inline;
  }

  #description {
    height: 100px;
    margin-left: 10px;
    margin-top: 10px;
  }

  #comfirmPwdLabel {
    display: inline;
  }

  .password-container {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .pwd-error {
    color: rgba(248, 86, 86, 0.758);
    font-size: 14px;
    white-space: nowrap;
    margin-bottom: 13px;
  }
</style>
