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

  let background;
  onMount(() => {
    background = document.querySelector('.login-container');
    background.addEventListener('mousemove', handleMouseMove);
  });

  function handleMouseMove(event) {
    const rect = background.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    background.style.transition = 'background 5s ease';
    background.style.background = `radial-gradient(circle at ${x}px ${y}px, #FFE4E1 10%, pink 30%, lightpink 50%)`;
  }

 

  function closeUserPopUpwindow() {
    displayUserPopUpwindow = false;
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
            goto("/");
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
  <button class="overlay" on:click={closeUserPopUpwindow}>
    <button on:click|stopPropagation style="background-color: transparent; border: none;">
      {#if displayloginFailed}
        <AlertWindow message="login failed" on:confirm={() => (displayloginFailed = false)} />
        <!-- pass the message prop to the alertWindow component -->
      {/if}

      {#if !$logedIn}
        {#if displayRegister}
          <UserRegister />
        {:else}
        <div class="login">
          <div class="login-container">
            <div class="login-header">
              <p class="LoginTitle">Log in</p>
            </div>

            <p class="welcomeMsg">Wherecome to Pinkbook</p>
            <form on:submit={handleLogin}>
              <div class="userInput">
                <div class="form-group input-container input-username">
                  <input type="text" id="username" bind:value={username} placeholder=" " required />
                  <label for="username">username</label>
                </div>
                <div class="form-group input-container">
                  <input
                    type="password"
                    id="password"
                    bind:value={password}
                    placeholder=" "
                    required
                  />
                  <label for="password">password</label>
                </div>
              </div>

              <div class="signUpMsg">
                <span>don't you have an account?</span>
                <button type="button" class="signUpbtn" on:click={toggleRegister}>
                  <u>sign up</u>
                </button>
              </div>
              <div class="form-group">
                <button type="submit" class=loginBtn>login</button>
              </div>
            </form>
          </div>
        </div>
        {/if}
      {/if}
    </button>
  </button>
{/if}

<style>
  .LoginTitle {
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
    width: 30%;
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

  .input-container {
    position: relative;
  }

  .form-group label {
    display: block;
    margin-bottom: 0px;
    top: 10px;
    left: 10px;
    transition: all 0.3s;
    color: #aaa;
    position: absolute;
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

  .form-group button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: rgb(81, 80, 80);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .input-username {
    border-bottom: 1px solid #aaa;
  }

  .signUpbtn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #aaa;
    font-size: 15px;
    font-weight: bold;
    
  }

  .signUpMsg {
    display: flex;
    align-items: center;
    margin-top: 10px;
    align-items: center;
    justify-content: center;
    margin-top: -12px;
    margin-bottom: 30px;
    font-weight: 100;
    color: #515151;
  }

  .loginBtn {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 10px;
  background: linear-gradient(90deg, pink, #FFE4E1);
  transition: background 5s ease;
  height: 50px;
  font-size: 16px;
  opacity: 1;
  }

  
</style>
