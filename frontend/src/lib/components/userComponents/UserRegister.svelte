<script>
  import { onMount } from "svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { BedDouble } from "lucide-svelte";

  let user = {
    username: "",
    fname: "",
    lname: "",
    description: "",
    dob: "",
    pwd: "",
    icon: ""
  };

  $: logInInfo = {
    username: user.username,
    password: user.pwd
  };
  let loading = false; // 设置初始加载状态为false

  // 提交表单的处理函数
  async function handleRegister(event) {
    event.preventDefault();
    loading = true;

    try {
      console.log("发送用户数据:", user);
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user),
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
</script>

<div class="form-container">
  <h2>register one</h2>
  <form on:submit={handleRegister}>
    <div class="form-group">
      <label for="username">username</label>
      <input type="text" id="username" bind:value={user.username} required />
    </div>
    <div class="form-group">
      <label for="fname">first name</label>
      <input type="text" id="fname" bind:value={user.fname} required />
    </div>
    <div class="form-group">
      <label for="lname">last name</label>
      <input type="text" id="lname" bind:value={user.lname} required />
    </div>
    <div class="form-group">
      <label for="description">description</label>
      <input type="text" id="description" bind:value={user.description} required />
    </div>
    <div class="form-group">
      <label for="dob">date of birth</label>
      <input type="date" id="dob" bind:value={user.dob} required />
    </div>
    <div class="form-group">
      <label for="pwd">password</label>
      <input type="password" id="pwd" bind:value={user.pwd} required />
    </div>
    <div class="form-group">
      <label for="icon">icon</label>
      <input type="text" id="icon" bind:value={user.icon} required />
    </div>
    <div class="form-group">
      <button type="submit">finish</button>
    </div>
  </form>
</div>

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
