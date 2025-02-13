<script>
  import TinyMCE from "@tinymce/tinymce-svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { page } from "$app/stores";
  import { get } from "svelte/store";
  // Use store to store user information
  import { writable } from "svelte/store";
  import AlertWindow from "../../../../lib/components/utils/alertWindow.svelte";
  import DeleteConfirmWindow from "../../../../lib/components/utils/DeleteConfirmWindow.svelte";

  let title = "";
  let content = "";
  let image = null;
  // Used to store existing article images
  let existingImage = null;
  let apiKey = "isispwbzpba6wf2rc8djljndp26nq2f6ueiclzfjlh2tcjgx";

  let articleId = "";
  // Store user information
  let user = writable(null);
  let showWindow = false;
  let showErrorWindow = false;
  let showDeleteImageWindow = false;
  let windowMessage = "Article edited successfully!";
  let errorWindowMessage = "";
  let deleteImageMessage = "Are you sure you want to delete this image?";
  let imageToDelete = null;
  let haveNewImg = true;
  let displayOriginalImg = null;
  let previewUrl = '';

  let conf = {
    toolbar:
      "undo redo | formatselect | bold italic underline | bullist numlist| alignleft aligncenter alignright alignjustify | table",
    menubar: false,
    plugins: "lists table",
    content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }"
  };

  //Get user information
  async function fetchUser() {
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/users`, {
        method: "GET",
        credentials: "include"
      });
      if (res.ok) {
        const userData = await res.json();
        //Store user information
        user.set(userData);
      } else {
        errorWindowMessage = "Unauthorized: Please log in first.";
        showErrorWindow = true;
      }
    } catch (error) {
      errorWindowMessage = "Error fetching user.";
      showErrorWindow = true;
    }
  }

  // Get article data
  async function fetchArticle() {
    try {
      articleId = get(page).params.id;
      console.log("Edit article ID:", articleId);

      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`);
      if (response.ok) {
        const article = await response.json();
        title = article.title || "";
        content = article.content || "";
        // Store image URLs in the article
        existingImage = article.image_url || null;
        if (existingImage) {
          haveNewImg=false;
          displayOriginalImg = true;
        } else {
          displayOriginalImg = false;
        }
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
    //First, get the user
    await fetchUser();
    //Then, get the article
    await fetchArticle();
    
    return () => {
      // Cleanup preview URL when component is destroyed
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  });

  // Send update request
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
    } else if (existingImage === null) {
      formData.append("image", ""); // ✅ Explicitly tell backend to remove image
    }

    console.log("🔍 Submitting formData:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]); // ✅ Log each key-value pair
    }

    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/edit`, {
      method: "PUT",
      body: formData,
      // Include session in the request
      credentials: "include"
    });

    if (res.ok) {
      windowMessage = "Article edited successfully!";
      showWindow = true;
    } else {
      const errorData = await res.json();
      console.error("❌ Server Error:", errorData);
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

  async function deleteImage() {
    if (!existingImage) return;
    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/delete-image`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        existingImage = null; // ✅ Remove image preview
        imageToDelete = null;
        document.getElementById("image").value = ""; // ✅ Clear file input
        haveNewImg=true;
      } else {
        errorWindowMessage = "Failed to delete image.";
        showErrorWindow = true;
      }
    } catch (error) {
      errorWindowMessage = "Network error. Try again later.";
      showErrorWindow = true;
    }

    showDeleteImageWindow = false;
  }

  function deleteTempImg(){
    existingImage=null;
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      image = file;
      previewUrl = URL.createObjectURL(file);
      displayOriginalImg = false;
    }
  }

  function clearImageSelection() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = '';
    }
    image = null;
    document.getElementById('image').value = '';
    showDeleteImageWindow = false;
  }

  function handleDeleteImage() {
    if (previewUrl) {
      clearImageSelection();
    } else if (existingImage) {
      deleteImage();
    }
  }

  function cancelDeleteImage() {
    showDeleteImageWindow = false;
    displayOriginalImg = true; // Keep showing the original image if delete is cancelled
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

  <!-- Image Upload Section -->
  <div class="image-section">
    <label for="image" class="upload-label">
      <div class="upload-area">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>Choose an image to upload</span>
      </div>
    </label>
    <input
      type="file"
      id="image"
      accept="image/*"
      on:change={handleFileSelect}
      class="hidden-input"
    />

    <!-- Preview Section -->
    <div class="preview-container">
      {#if previewUrl}
        <div class="preview-header">
          <h3>New Image Preview:</h3>
          <button class="delete-image-button" on:click={confirmDeleteImage}>
            Delete
          </button>
        </div>
        <div class="image-preview">
          <img src={previewUrl} alt="Preview" />
        </div>
      {:else if !haveNewImg && displayOriginalImg && existingImage}
        <div class="preview-header">
          <h3>Current Image:</h3>
          <button class="delete-image-button" on:click={confirmDeleteImage}>
            Delete
          </button>
        </div>
        <div class="image-preview">
          <img src={existingImage} alt="Current" />
        </div>
      {/if}
    </div>
  </div>

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
  <DeleteConfirmWindow
    message={deleteImageMessage}
    on:confirm={handleDeleteImage}
    on:cancel={cancelDeleteImage}
  />
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
    background: linear-gradient(90deg, rgba(255,192,203,0.8), rgba(255,228,225,0.8));
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

  /* 确保其他按钮样式保持不变 */
  .delete-image-button {
    background: linear-gradient(90deg, rgba(255, 99, 71, 0.8), rgba(255, 127, 80, 0.8));
    color: white;
    margin: 0;
  }

  .image-section {
    margin: 1.5rem 0;
  }

  .upload-label {
    cursor: pointer;
    display: block;
    margin-bottom: 1rem;
  }

  .upload-area {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    background: rgba(255,192,203,0.1);
  }

  .upload-area:hover {
    border-color: pink;
    background: rgba(255,192,203,0.2);
  }

  .upload-area svg {
    margin-bottom: 0.5rem;
    color: #666;
  }

  .hidden-input {
    display: none;
  }

  .preview-container {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(255,192,203,0.1);
    border-radius: 10px;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
  }

  .preview-header h3 {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
  }

  .delete-image-button {
    background: linear-gradient(90deg, rgba(255, 99, 71, 0.8), rgba(255, 127, 80, 0.8));
    color: white;
    padding: 6px 16px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .delete-image-button:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
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

  #title {
    width: 96%;
  }

  @media (max-width: 768px) {
    .preview-container {
      padding: 0.8rem;
    }

    .preview-header {
      margin-bottom: 0.6rem;
    }

    .delete-image-button {
      padding: 4px 12px;
      font-size: 0.8rem;
    }

    .image-preview img {
      max-height: 200px;
    }
  }


</style>
