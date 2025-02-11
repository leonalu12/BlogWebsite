<script>
  import TinyMCE from "@tinymce/tinymce-svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { page } from "$app/stores";
  import { get } from "svelte/store";
  import { writable } from "svelte/store"; // ✅ 使用 store 存储用户信息
  import AlertWindow from "../../../../lib/components/utils/alertWindow.svelte";
  import DeleteConfirmWindow from "../../../../lib/components/utils/DeleteConfirmWindow.svelte";

  let title = "";
  let content = "";
  let image = null;
  let existingImage = null; // ✅ 用于存储已存在的文章图片
  let apiKey = "isispwbzpba6wf2rc8djljndp26nq2f6ueiclzfjlh2tcjgx";


  let articleId = ""; 
  let user = writable(null); // ✅ 存储用户信息
  let showWindow=false;
  let showErrorWindow = false;
  let showDeleteImageWindow = false;
  let windowMessage = "Article updated successfully!"
  let errorWindowMessage = "";
  let deleteImageMessage = "Are you sure you want to delete this image?";
  let imageToDelete = null;

  let conf = {
    toolbar:
      "undo redo | formatselect | bold italic underline | bullist numlist| alignleft aligncenter alignright alignjustify | table",
    menubar: false,
    plugins: "lists table",
    content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }"
  };

  // ✅ 获取用户信息
  async function fetchUser() {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/users`, {
        method: "GET",
        credentials: "include"
      });
      if (res.ok) {
        const userData = await res.json();
        user.set(userData); // ✅ 存储用户信息
      }
      else{
        errorWindowMessage = "Unauthorized: Please log in first."
        showErrorWindow = true;
      }
    } catch (error) {
      errorWindowMessage = "Error fetching user.";
      showErrorWindow = true;
    }
  }

  // ✅ 获取文章数据
  async function fetchArticle() {
    try {
      articleId = get(page).params.id; 
      console.log("编辑文章 ID:", articleId);

      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`);
      if (response.ok) {
        const article = await response.json();
        title = article.title || "";
        content = article.content || "";
        existingImage = article.image_url || null; // ✅ 存储文章中的图片 URL
      } else {
        errorWindowMessage = "Failed to fetch the article.";
        showErrorWindow = true;
      }
    } catch (error) {
      errorWindowMessage = "Internet error, please try later.";
      showErrorWindow = true;
    }
  }

  onMount(async () => {
    await fetchUser(); // ✅ 先获取用户
    await fetchArticle(); // ✅ 再获取文章
  });

  // ✅ 发送更新请求
  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      errorWindowMessage = "Title and content are required.";
      showErrorWindow = true;
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (image) {
      formData.append("image", image);
    } else if (!existingImage) {
      formData.append("image", ""); // ✅ 允许删除现有图片
    }

    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/edit`, {
      method: "PUT",
      body: formData,
      credentials: "include" // ✅ 让请求带上 session
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

  function confirmDeleteImage() {
    showDeleteImageWindow = true;
  }

  function deleteImage() {
    imageToDelete = null;
    existingImage = null;
    showDeleteImageWindow = false;
    document.getElementById("image").value = "";
  }

  function cancelDeleteImage(){
    showDeleteImageWindow = false;
    imageToDelete = nunll;
  }
</script>

<div class="article-form">
  <h1>Edit your article</h1>

  <!-- Article Title -->
  <label for="title">Title:</label>
  <input type="text" id="title" bind:value={title} placeholder="Enter article title" required />

  <!-- WYSIWYG Editor -->
  <label for="content">Content:</label>
  <TinyMCE {apiKey} bind:value={content} {conf} />

  <!-- Image Upload -->
  <label for="image">Upload Image (optional):</label>
  <input type="file" id="image" accept="image/*" on:change={(e) => (image = e.target.files[0])} />
  {#if existingImage}
    <p>Original Image: <img src={existingImage} alt="Existing Image" width="100" /></p>
    <button class="delete-image-button" on:click={confirmDeleteImage}>Delete Image</button>
  {/if}
  <!-- Submit Button -->
  <button on:click={handleSubmit}>Update</button>
</div>

{#if showWindow}
  <AlertWindow message={windowMessage} on:confirm={handleConfirm} />
{/if}

{#if showErrorWindow}
  <AlertWindow message={errorWindowMessage} on:confirm={handleErrorSubmit} />
{/if}

{#if showDeleteImageWindow}
  <DeleteConfirmWindow message = {deleteImageMessage} on:confirm={deleteImage} on:cancel={cancelDeleteImage} />
{/if}

<style>
  .article-form {
    max-width: 600px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  label {
    font-weight: bold;
    margin-top: 10px;
  }

  input[type="text"],
  input[type="file"] {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    width: 100%;
  }

  .error {
    color: red;
    font-size: 14px;
  }

  button {
    background: #007bff;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
  }

  button:hover {
    background: #0056b3;
  }
</style>
