<script>
  import { onMount } from "svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { displayEdit } from "../../store/userStore.js";
  import { displayEditSuccessAlert } from "../../store/userStore.js";
  import AlertWindow from "../utils/AlertWindow.svelte";
  import { iconName } from "../../store/userStore.js";

  let user = {
    username: "",
    fname: "",
    lname: "",
    description: "",
    dob: "",
    icon: ""
  };
  let iconImage = null;
  let tempUsername = "";
  let loading = true;
  let alertMessage = "";
  let isUniqueUsername = true;
  let displayEditfailAlert = false;
  let displayUserPopUpwindow = true;


  function closeUserPopUpwindow() {
    displayUserPopUpwindow = false;
    displayEdit.set(false);
  }

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
        icon: data.icon
      };
      tempUsername = user.username;
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      loading = false;
    }
    console.log("User Information:", user);
  });

  // 提交表单的处理函数
  async function handleSubmit(event) {
    event.preventDefault();
    console.log("User Information:", user);
    if (!isUniqueUsername) {
      displayEditfailAlert = true;
      alertMessage = "username already exists";
      return;
    }
    // 这里可以添加提交表单的逻辑，例如通过 API 保存用户信息
    try {
      console.log("发送用户数据:", user);
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("fname", user.fname);
      formData.append("lname", user.lname);
      formData.append("description", user.description);
      formData.append("dob", user.dob);
      formData.append("icon", iconImage);

      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/`, {
        method: "PATCH",

        body: formData,
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("网络响应问题");
      } else {
        displayEdit.set(false);
        displayEditSuccessAlert.set(true);
        console.log("User Information Updated");
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      loading = false;
    }
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/auth/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: user.username }),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("network response error");
      }
      const data = await response.json();
      console.log("relogin success:", data);
      logedIn.set(true);
    } catch (error) {
      console.error("relogin fail:", error);
    }
    console.log("User Information:", user);

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

  async function checkUsername() {
    if (!(user.username === tempUsername)) {
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
  }
</script>

<button class="overlay" on:click={closeUserPopUpwindow}>
  <button on:click|stopPropagation>
  <div class="form-container">
    <h2>editing user information</h2>
    {#if loading}
      <p>loading...</p>
    {:else}
      <form on:submit={handleSubmit}>
        <div class="form-group">
          <label for="username">username</label>
          <input
            type="text"
            id="username"
            bind:value={user.username}
            on:input={checkUsername}
            required
          />
        </div>
        {#if !isUniqueUsername}
          <p style="color: red;">username already existed</p>
        {/if}
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
          <label for="icon">icon</label>
          <input
            type="file"
            id="icon"
            accept="image/*"
            on:change={(e) => (iconImage = e.target.files[0])}
          />
        </div>
        <div class="form-group">
          <button type="submit">save</button>
        </div>
      </form>
    {/if}
  </div>
</button>
</button>

{#if displayEditfailAlert}
  <AlertWindow message={alertMessage} on:confirm={() => (displayEditfailAlert = false)} />
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
  .form-container {
    z-index: 1000;
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
