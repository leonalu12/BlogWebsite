<script>
  import TinyMCE from "@tinymce/tinymce-svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../../../lib/components/utils/alertWindow.svelte";
  import DeleteConfirmWindow from "../../../lib/components/utils/DeleteConfirmWindow.svelte";
  import { writable } from "svelte/store";
  import UserLogin from "../../../lib/components/userComponents/UserLogin.svelte";
  import { displayLogin } from "../../../lib/store/userStore";
  import { logedIn } from "../../../lib/store/userStore";
  import { iconName } from "../../../lib/store/userStore";

  let title = "";
  let content = "";
  let image = null;
  let previewUrl = ""; // 新增: 用于存储预览URL
  let apiKey = "isispwbzpba6wf2rc8djljndp26nq2f6ueiclzfjlh2tcjgx";
  let showWindow = false;
  let windowMessage = "";
  let showErrorWindow = false;
  let errorWindowMessage = "";
  let showDeleteImageWindow = false;
  let deleteImageMessage = "Are you sure you want to delete this image?";

  let imageToDelete = null;
  // Store user information
  let user = writable(null); // ✅ 存储用户信息

  let conf = {
    toolbar:
      "undo redo | formatselect | bold italic underline | bullist numlist| alignleft aligncenter alignright alignjustify | table",
    menubar: false,
    plugins: "lists table",
    content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }"
  };

  //Get current user
  async function fetchUser() {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/users`, {
        method: "GET",
        credentials: "include"
      });

      if (res.ok) {
        const userData = await res.json();
        // Store user information
        user.set(userData);
        console.log(" Fetched user:", userData);
      } else if (res.status === 401) {
        console.error(" User is not logged in. Redirecting...");
        displayLogin.set(true);
      }
    } catch (error) {
      errorWindowMessage = "Error fetching user.";
      showErrorWindow = true;
    }
  }

  onMount(() => {
    fetchUser();
    // 清理预览URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  });

  onMount(async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/auth/check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      if (response.ok) {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/users/icon`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error(" Failed to retrieve user avatar");
        } else {
          const data = await response.json();
          iconName.set(data);
          console.log("get img successful:", data);
          logedIn.set(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user avatar:", error);
    }
  });

  //Submit article
  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      errorWindowMessage = "Title and content are required.";
      showErrorWindow = true;
      return;
    }

    let currentUser;
    //Get user
    user.subscribe((value) => (currentUser = value))();

    if (!currentUser) {
      displayLogin.set(true);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/new`, {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (res.ok) {
      windowMessage = "Article created successfully!";
      showWindow = true;
    } else {
      errorWindowMessage = "Failed to create article. Please try again.";
      showErrorWindow = true;
    }
  }

  function handleConfirm() {
    showWindow = false;
    goto("/");
  }

  function handleErrorSubmit() {
    showErrorWindow = false;
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      // 清理已存在的预览URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      image = file;
      previewUrl = URL.createObjectURL(file);
    }
  }

  function clearImageSelection() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    image = null;
    previewUrl = "";
    document.getElementById("image").value = "";
    showDeleteImageWindow = false;
  }

  function confirmDeleteImage() {
    showDeleteImageWindow = true;
  }

  function deleteImage() {
    clearImageSelection();
    showDeleteImageWindow = false;
  }

  function cancelDeleteImage() {
    showDeleteImageWindow = false;
    imageToDelete = null;
  }

  function formatFileName(name) {
    if (name.length > 20) {
      return name.substring(0, 20) + "...";
    }
    return name;
  }

  function handleDeleteImage() {
    clearImageSelection();
    showDeleteImageWindow = false;
  }
</script>

{#if $logedIn}
  <div class="article-form">
    <h1>Write your article here</h1>

    <!-- Article Title -->
    <label for="title">Title:</label>
    <input type="text" id="title" bind:value={title} placeholder="Enter article title" required />

    <!-- WYSIWYG Editor -->
    <label for="content">Content:</label>
    <TinyMCE {apiKey} bind:value={content} {conf} />

    <div class="file-input-container">
      <label for="image" class="file-input-label">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>Choose an image to upload</span>
      </label>
      <input
        type="file"
        id="image"
        accept="image/*"
        on:change={handleFileSelect}
        class="hidden-input"
      />

      <!-- Preview Section -->
      {#if previewUrl}
        <div class="preview-container">
          <div class="preview-header">
            <h3>Image Preview:</h3>
            <button class="delete-image-button" on:click={confirmDeleteImage}> Delete </button>
          </div>
          <div class="image-preview">
            <img src={previewUrl} alt="Preview" />
          </div>
        </div>
      {/if}
    </div>
    <!-- Submit Button -->
    <button on:click={handleSubmit}>Publish</button>
  </div>
{:else}
  <p>Please log in to write an article.</p>
{/if}

{#if showWindow}
  <AlertWindow message={windowMessage} on:confirm={handleConfirm} />
{/if}

{#if showErrorWindow}
  <AlertWindow message={errorWindowMessage} on:confirm={handleErrorSubmit} />
{/if}

{#if showDeleteImageWindow}
  <DeleteConfirmWindow
    message={deleteImageMessage}
    on:confirm={handleDeleteImage}
    on:cancel={cancelDeleteImage}
  />
{/if}

{#if $displayLogin}
  <UserLogin />
{/if}

<style>
  .article-form {
    max-width: 800px;
    margin: 95px auto 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 20;
  }

  h1 {
    color: #333;
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  label {
    font-weight: 600;
    color: #666;
    font-size: 0.9em;
    margin-top: 1rem;
  }

  input[type="text"] {
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 1rem;
    width: 100%;
    transition: all 0.2s ease;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: pink;
    box-shadow: 0 0 0 2px rgba(255, 192, 203, 0.2);
  }

  input[type="file"] {
    padding: 10px;
    border: 2px dashed #ddd;
    border-radius: 20px;
    font-size: 0.9rem;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input[type="file"]:hover {
    border-color: pink;
    background: rgba(255, 192, 203, 0.05);
  }

  button {
    background: linear-gradient(90deg, rgba(255, 192, 203, 0.8), rgba(255, 228, 225, 0.8));
    color: #333;
    padding: 12px 24px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  button:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  button:active {
    transform: scale(0.98);
  }

  .delete-image-button {
    background: linear-gradient(90deg, rgba(255, 99, 71, 0.8), rgba(255, 127, 80, 0.8));
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    justify-content: center;
    align-items: center;
    margin: 0;
  }

  /* Error message styling */
  .error {
    color: #ff4444;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  /* Not logged in message styling */
  p {
    text-align: center;
    color: #666;
    font-size: 1.1rem;
    margin-top: 95px;
    padding: 2rem;
    background: white;
    border-radius: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .article-form {
      margin: 75px 1rem 20px;
      padding: 1.5rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    button {
      padding: 10px 20px;
    }
  }

  .file-input-container {
    position: relative;
    margin-top: 1rem;
  }

  .file-input-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    background: linear-gradient(90deg, rgba(255, 192, 203, 0.1), rgba(255, 228, 225, 0.1));
    border: 2px dashed rgba(255, 192, 203, 0.5);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .file-input-label:hover {
    background: linear-gradient(90deg, rgba(255, 192, 203, 0.2), rgba(255, 228, 225, 0.2));
    border-color: pink;
  }

  .file-input-label span {
    color: #666;
    font-size: 1rem;
  }

  input[type="file"] {
    position: absolute;
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    z-index: -1;
  }

  .file-preview {
    margin-top: 1rem;
    padding: 10px;
    background: rgba(255, 192, 203, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .file-name {
    color: #666;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preview-container {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(255, 192, 203, 0.1);
    border-radius: 10px;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
  }

  #title {
    width: 96%;
  }

  .preview-header h3 {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
  }

  .image-preview {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .image-preview img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    .preview-container {
      padding: 0.8rem;
    }

    .preview-header {
      margin-bottom: 0.6rem;
    }

    .image-preview img {
      max-height: 200px;
    }
  }
</style>
