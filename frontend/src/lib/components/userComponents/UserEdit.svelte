<script>
  import { onMount } from "svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { displayEdit } from "../../store/userStore.js";

  let user = {
    username: "",
    fname: "",
    lname: "",
    description: "",
    dob: "",
    pwd: "",
    icon: ""
  };
  let loading = true;

  // 在组件挂载时获取数据
  onMount(async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/`, {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("网络响应问题");
      }
      const data = await response.json();
      user = {
        username: data.username,
        fname: data.fname,
        lname: data.lname,
        description: data.description,
        dob: data.dob,
        pwd: "",
        icon: data.icon
      };
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      loading = false;
    }
  });

  // 提交表单的处理函数
  async function handleSubmit(event) {
    event.preventDefault();
    console.log("User Information:", user);
    // 这里可以添加提交表单的逻辑，例如通过 API 保存用户信息
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
        throw new Error("网络响应问题");
      }else{
        displayEdit.set(false);
        console.log("User Information Updated");
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      loading = false;
    }
  }
</script>


<div class="form-container">
  <h2>编辑用户信息</h2>
  {#if loading}
    <p>正在加载数据...</p>
  {:else}
    <form on:submit={handleSubmit}>
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
        <input type="pwd" id="pwd" bind:value={user.pwd} required />
      </div>
      <div class="form-group">
        <label for="icon">icon</label>
        <input type="text" id="icon" bind:value={user.icon} required />
      </div>
      <div class="form-group">
        <button type="submit">save</button>
      </div>
    </form>
  {/if}
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
