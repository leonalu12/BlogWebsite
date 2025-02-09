<script>
  import TinyMCE from "@tinymce/tinymce-svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import AlertWindow from "../../../lib/components/utils/alertWindow.svelte";

 
  let title = "";
  let apiKey = "isispwbzpba6wf2rc8djljndp26nq2f6ueiclzfjlh2tcjgx";
  let userId = 2; // Replace with dynamic authentication in the future
  let errorMessage = "";
  let content = "";
  let image = null;
  let showWindow = false;
  let windowMessage = "";
  let showErrorWindow = false;
  let errorWindowMessage="";

  let conf = {
    toolbar:
      "undo redo | formatselect | bold italic underline | bullist numlist| alignleft aligncenter alignright alignjustify | table",
    menubar: false,
    plugins: "lists table",
    content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }"
  };

  console.log("Editor Content Before Submit:", content);

  // Function to handle form submission
  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      errorWindowMessage = "Title and content are required.";
      showErrorWindow = true;
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("userId", userId);

    if (image) formData.append("image", image);
    
    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/new`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      windowMessage = ("Article created successfully!");
      showWindow = true;
    } else {
      errorWindowMessage = "Article title and content cannot be empty!"
      showErrorWindow = true;
    }
  
 
  
  }

  function handleConfirm(){
    showWindow = false;
    goto("/");
  }

  function handleErrorSubmit(){
    showErrorWindow = false;
  }
</script>

<div class="article-form">
  <h1>Write your article here</h1>

  <!-- Article Title -->
  <label for="title">Title:</label>
  <input type="text" id="title" bind:value={title} placeholder="Enter article title" required />

  <!-- WYSIWYG Editor -->
  <label for="content">Content:</label>
  <TinyMCE {apiKey} bind:value={content} {conf} />

  <!-- Image Upload -->
  <label for="image">Upload Image (optional):</label>
  <input type="file" id="image" accept="image/*" on:change={(e) => (image = e.target.files[0])} />

  <!-- Submit Button -->
  <button on:click={handleSubmit}>Publish</button>
</div>

{#if showWindow}
<AlertWindow message = {windowMessage} on:confirm={handleConfirm} />
{/if}

{#if showErrorWindow}
<AlertWindow message = {errorWindowMessage} on:confirm = {handleErrorSubmit} />
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
