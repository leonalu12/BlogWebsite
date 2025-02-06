<script>
  import TinyMCE from "@tinymce/tinymce-svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  let title = "";
    let apiKey = "isispwbzpba6wf2rc8djljndp26nq2f6ueiclzfjlh2tcjgx";
    let userId = 2; // Replace with dynamic authentication in the future
    let errorMessage = "";
    let content = '';
    let image = null;
    let conf = {
        toolbar: 'undo redo | formatselect | bold italic underline | bullist numlist| alignleft aligncenter alignright alignjustify | table',
        menubar: false,
        plugins: 'lists table',
    //     forced_root_block: "",  // 彻底禁用 <p>，改为空字符串
    // force_br_newlines: true,  //   换行使用 <br>
    // force_p_newlines: false,  //   禁止换行时自动生成 <p>
    // valid_elements: "*[*]",   //   允许所有元素，不进行强制格式化
    // extended_valid_elements: "*[*]",
        content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }'
    };


  //   onMount(() => {
  //     tinymce.remove(); // Clears any previous TinyMCE instances
  //   });

  //   onDestroy(() => {
  //     tinymce.remove(); // Ensure cleanup when navigating away
  //   });

  // Function to handle form submission
  console.log("Editor Content Before Submit:", content);
  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      errorMessage = "Title and content are required.";
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
      alert("Article created successfully!");
      goto("/");
    } else {
      errorMessage = "Something went wrong. Please try again.";
    }
  }
</script>

<div class="article-form">
  <h1>Write your article here</h1>

  <!-- Error Message -->
  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  <!-- Article Title -->
  <label for="title">Title:</label>
  <input type="text" id="title" bind:value={title} placeholder="Enter article title" required />

  <!-- WYSIWYG Editor -->
  <label for="content">Content:</label>
  <TinyMCE
      {apiKey}
      bind:value={content}
      conf={conf}
  />
 

  <!-- Image Upload -->
  <label for="image">Upload Image (optional):</label>
  <input type="file" id="image" accept="image/*" on:change={(e) => (image = e.target.files[0])} />

  <!-- Submit Button -->
  <button on:click={handleSubmit}>Publish</button>
</div>

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
