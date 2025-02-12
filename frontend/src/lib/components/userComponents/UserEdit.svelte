<script>
  import { onMount } from "svelte";
  import { logedIn } from "../../store/userStore.js";
  import { PUBLIC_API_BASE_URL, PUBLIC_IMAGES_URL } from "$env/static/public";
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
  let imagePreview = null;

  function closeUserPopUpwindow() {
    displayUserPopUpwindow = false;
    displayEdit.set(false);
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    iconImage = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // 在组件挂载时获取数据
  onMount(async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/`, {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Network error");
      }
      const data = await response.json();
      const formattedDate = new Date(data.dob).toISOString().split("T")[0];

      // Create image preview if icon exists
      if (data.icon) {
        imagePreview = `${PUBLIC_IMAGES_URL}/${data.icon}`;
      }

      user = {
        username: data.username,
        fname: data.fname,
        lname: data.lname,
        description: data.description,
        dob: formattedDate,
        icon: data.icon
      };
      tempUsername = user.username;
      iconImage = data.icon;
    } catch (error) {
      console.error("Data fetch failed:", error);
    } finally {
      loading = false;
    }
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

{#if displayUserPopUpwindow}
  <button class="overlay" on:click={closeUserPopUpwindow}>
    <button on:click|stopPropagation style="background-color: transparent; border: none;">
      <div class="edit-container">
        <div class="edit-header">
          <p class="EditTitle">Edit User Information</p>
        </div>
        {#if loading}
          <p>loading...</p>
        {:else}
          <p></p>
          <form on:submit={handleSubmit}>
            <div class="userInput">
              <div class="form-group">
                <div class="image-upload">
                  <img
                    src={imagePreview || `${PUBLIC_IMAGES_URL}/default.png`}
                    alt="Profile"
                    class="profile-image"
                  />
                  <input
                    type="file"
                    id="icon"
                    accept="image/*"
                    bind:value={iconImage}
                    on:change={handleImageChange}
                    class="file-input"
                  />
                </div>
              </div>
              <div class="form-group input-container">
                <input
                  type="text"
                  id="username"
                  bind:value={user.username}
                  on:input={checkUsername}
                  placeholder=" "
                  required
                />
                <label for="username">username</label>
              </div>
              {#if !isUniqueUsername}
                <p style="color: red;">username already existed</p>
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
                <input type="date" id="dob" bind:value={user.dob} placeholder=" " required />
                <label for="dob">date of birth</label>
              </div>
              <div class="form-group input-container input-container-description">
                <textarea id="description" bind:value={user.description} placeholder=" " required
                ></textarea>
                <label for="description">description</label>
              </div>
            </div>

            <div class="form-group">
              <button type="submit" class="editBtn">save</button>
            </div>
          </form>
        {/if}
      </div>
    </button>
  </button>
{/if}

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

  .edit-container {
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

  .EditTitle {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: "Arial", sans-serif;
    text-align: center;
    border-bottom: #9c9b9b 1px solid;
    padding-bottom: 10px;
    margin: 0;
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

  .editBtn {
    border: none;
    border-radius: 4px;
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

  .editBtn:hover {
    transform: translateY(-3px);
  }

  .image-upload {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }

  .profile-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
  }

  .file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
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

  #description {
    height: 70px;
    margin-left: 7px;
    margin-top: 25px;
  }
</style>
