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
    } else if (!existingImage) {
      //Allow deleting existing images
      formData.append("image", ""); 
    }

    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/edit`, {
      method: "PUT",
      body: formData,
      // Include session in the request
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
    <p>Original Image: <img src={existingImage} alt="Existing Img" width="100" /></p>
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
