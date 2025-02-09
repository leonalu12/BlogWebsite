<script>
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../utils/AlertWindow.svelte";
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
  let loading = false; // 设置初始加载状态为false

  let diapalyAlert = false;
  let comfirmPwd = "";
  let isUniqueUsername = true;
  let alertMessage = "";

  // 提交表单的处理函数
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
      console.log("发送用户数据:", user);
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
        console.log("登录成功:", logedInData);
      }
    } catch (error) {
      console.error("注册错误:", error);
    } finally {
      loading = false; // 确保在请求后将加载状态设置为false
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

  // function handleIconChange(event) {
  //   iconImage = event.target.files[0];
  //   console.log("iconImage:", iconImage);
  //   user.icon = iconImage ? iconImage.name : "";
  //   console.log("user:", user);
  // }
</script>

<div class="form-container">
  <h2>register one</h2>
  <form on:submit={handleRegister}>
    <div class="form-group">
      <label for="username">username</label>
      <input
        type="text"
        id="username"
        bind:value={user.username}
        placeholder="Display to others"
        on:input={checkUsername}
        required
      />
    </div>
    <p style="color: red;">
      {#if !isUniqueUsername}username already exists{/if}
    </p>
    <div class="form-group">
      <label for="fname">first name</label>
      <input
        type="text"
        id="fname"
        bind:value={user.fname}
        placeholder="First name on ID"
        required
      />
    </div>
    <div class="form-group">
      <label for="lname">last name</label>
      <input type="text" id="lname" bind:value={user.lname} placeholder="Surname on ID" required />
    </div>
    <div class="form-group">
      <label for="description">description</label>
      <input
        type="text"
        id="description"
        bind:value={user.description}
        placeholder="Briefly introduce yourself"
        required
      />
    </div>
    <div class="form-group">
      <label for="dob">date of birth</label>
      <input type="date" id="dob" bind:value={user.dob} placeholder="Birthdate" required />
    </div>
    <div class="form-group">
      <label for="pwd">password</label>
      <input type="password" id="pwd" bind:value={user.pwd} required />
    </div>
    <div class="form-group">
      <label for="comfirmPwd">comfirm password</label>
      <input type="password" id="comfirmPwd" bind:value={comfirmPwd} required />
    </div>
    {#if user.pwd !== comfirmPwd}
      {#if user.pwd && comfirmPwd}
        <p style="color: red;">passwords do not match</p>
      {/if}
    {/if}
    <div class="form-group">
      <label for="icon">icon</label>
      <input
        type="file"
        id="icon"
        accept="image/*"
        on:change={(e) => (iconImage = e.target.files[0])}
      />
    </div>
    <div class="form-group">
      <button type="submit">finish</button>
    </div>
  </form>
</div>

{#if diapalyAlert}
  <AlertWindow message={alertMessage} on:confirm={() => (diapalyAlert = false)} />
{/if}

{#if loading}
  <div
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;"
  >
    <div style="background-color: white; padding: 20px; border-radius: 8px;">
      <div style="display: flex; justify-content: center; align-items: center;">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p style="margin-left: 10px;">loading...</p>
      </div>
    </div>
  </div>
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
