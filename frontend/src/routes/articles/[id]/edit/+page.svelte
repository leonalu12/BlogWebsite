<script>
  import TinyMCE from "@tinymce/tinymce-svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { page } from "$app/stores";
  import { get } from "svelte/store"; // ✅ 订阅 store 以获取 articleId

  let title = "";
  let content = "";
  let image = null;
  let userId = 2; // Replace with dynamic authentication in the future
  let apiKey = "isispwbzpba6wf2rc8djljndp26nq2f6ueiclzfjlh2tcjgx";
  let errorMessage = "";
  let articleId = ""; // ✅ 存储文章 ID

  // ✅ 正确获取 articleId
  onMount(async () => {
    articleId = get(page).params.id; // ✅ 订阅 $page，获取 ID
    console.log("编辑文章 ID:", articleId);

    const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`);
    if (response.ok) {
      const article = await response.json();
      title = article.title || "";//确保不为 undefined
      content = article.content || "";
    } else {
      errorMessage = "无法加载文章数据，请稍后重试。";
    }
  });

  // ✅ 发送更新请求
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

    const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/edit`, {
      method: "PUT",
      body: formData
    });

    if (res.ok) {
      alert("Article updated successfully!");
      goto(`/articles/${articleId}`); // ✅ 更新成功后跳转回文章详情页
    } else {
      errorMessage = "Something went wrong. Please try again.";
    }
  }
</script>

<div class="article-form">
  <h1>Edit your article</h1>

  <!-- Error Message -->
  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  <!-- Article Title -->
  <label for="title">Title:</label>
  <input type="text" id="title" bind:value={title} placeholder="Enter article title" required />

  <!-- WYSIWYG Editor -->
  <TinyMCE
    {apiKey}
    bind:value={content}
    init={{
      selector: "textarea",
      height: 300,
      menubar: false,
      plugins: "lists advlist",
      toolbar: "undo redo | bold italic underline | bullist numlist",
      menu: { tools: { title: "Tools", items: "listprops" } },
      lists_indent_on_tab: false,
      content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }"
    }}
  />

  <!-- Image Upload -->
  <label for="image">Upload Image (optional):</label>
  <input type="file" id="image" accept="image/*" on:change={(e) => (image = e.target.files[0])} />

  <!-- Submit Button -->
  <button on:click={handleSubmit}>Update</button>
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
