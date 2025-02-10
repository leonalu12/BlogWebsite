<script>
  
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  
  import { onMount } from "svelte";

  // import flatpickr from "flatpickr";
  // import "flatpickr/dist/flatpickr.min.css";

  // let dateInput; // 用于绑定输入框

// // 初始化日期选择器
// onMount(() => {
//   if (dateInput) {
//     flatpickr(dateInput, {
//       locale: "en", // 强制设置为英文
//       dateFormat: "Y-m-d"
//     });
//   }
// });

let searchQuery = ""; // 搜索输入框的值
let filterBy = "title"; // 过滤字段
let sortBy = "date_time"; // 排序字段
let exactDate = ""; 
let order = "DESC"; // 排序方式
let articles = []; // 文章列表




// 获取文章的方法
async function fetchArticles() {
    const queryParams = new URLSearchParams({
      search: searchQuery,
      filterBy,
      sortBy,
      order,
      ...(filterBy === "date_time" && exactDate ? { exactDate } : {}) 
    });

    console.log("🛠 发送的 API 请求:", `${PUBLIC_API_BASE_URL}/articles?${queryParams}`);

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      articles = await response.json();
      console.log(" 获取到的文章:", articles); // ✅ **调试**
    } catch (error) {
      console.error(" 获取文章失败:", error);
    }
}


  // 组件加载时获取文章
  onMount(fetchArticles);

  function handleSearch() {
  if (filterBy === "date_time" && exactDate) {
    let formattedDate = new Date(exactDate).toISOString().split("T")[0]; 
    console.log("📅 传递到后端的日期:", formattedDate);
    exactDate = formattedDate;
  } else {
    console.log("🔎 不是日期筛选，正常查询");
  }

  // ✅ **去除 Unicode 引号，防止错误字符**
  searchQuery = searchQuery.replace(/[“”„‟❝❞＂]/g, '"').trim();

  fetchArticles();
}
  
  // **新增：支持动态切换搜索类型（title, username, date_time）**
  function handleFilterChange(event) {
    filterBy = event.target.value;
    if (filterBy !== "date_time") {
      exactDate = ""; //  **如果不是按日期搜索，则清空日期选择**
    }
    fetchArticles();
  }

  // 处理排序
  function handleSort(event) {
    sortBy = event.target.value;
    fetchArticles();
  }

  // 处理升降序切换
  function toggleOrder() {
    order = order === "ASC" ? "DESC" : "ASC";
    fetchArticles();
  }
</script>


<svelte:head>
  <title>Home</title>
</svelte:head>

<h1>home page test</h1>
<a href={`/myArticles`} class="my-articles-btn">My Articles</a>

<div class="search-container">
  <div class="search-bar">
    <input type="text" bind:value={searchQuery} placeholder="Search..." />
    <button on:click={handleSearch}>Search</button>
  </div>

  <div class="filter-bar">
    <label>Filter by:</label>
    <select bind:value={filterBy} on:change={handleFilterChange}> <!-- **新增：搜索类型选择框** -->
      <option value="title">Title</option>
      <option value="username">Username</option>
      <option value="date_time">Date</option>
    </select>
  </div>

  {#if filterBy === "date_time"}
  <div class="date-filter">
    <label>Pick a date:</label>
    <input type="date" bind:value={exactDate} on:change={handleSearch} />
  </div>
{/if}
</div>

<div class="sort-bar">
  <label>Sort by:</label>
  <select bind:value={sortBy} on:change={handleSort}>
    <option value="date_time">Date</option>
    <option value="title">Title</option>
    <option value="username">Username</option>
  </select>

  <button on:click={toggleOrder}>
    {order === "DESC" ? "⬇ Descending" : "⬆ Ascending"}
  </button>
</div>



<h2>Articles</h2>



<h2>Articles</h2>
<div class="articles">
  {#each articles as article}
    <span class="article">
      <a href={`/articles/${article.id}`}>
        <div>

          <div><img src="{ PUBLIC_IMAGES_URL }/{article.image_url}" alt="{article.title}" /></div>
          <div> {article.title}</div>
         <div>By: {article.username}</div> <!-- ✅ **新增：显示作者用户名** -->
          <div>Published on: {article.date_time}</div> <!-- ✅ **新增：显示发布时间** -->
          <div> {@html article.content}</div>

        </div>
      </a>
    </span>
  {/each}
</div>


<style>

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.search-bar, .filter-bar, .date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-filter input { /*  **新增：日期选择框样式** */
  padding: 8px;
}

 .articles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* 自适应列 */
  gap: 20px;
  padding: 20px;
  justify-content: center;
}

.article {
  height: auto;
  width: 100%; 
  max-width: 350px; 
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: white;
  transition: transform 0.3s ease-in-out;
}

.article:hover {
  transform: translateY(-5px);
}

img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
}

.article div {
  padding: 10px;
  font-size: 14px;
  line-height: 1.4;
}

</style>
