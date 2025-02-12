<script>
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { logedIn } from "../lib/store/userStore";
  import { onMount } from "svelte";
  import { iconName } from "../lib/store/userStore";
  import { displayLogin } from "../lib/store/userStore";
// Value of the search input field
  let searchQuery = ""; 
  // Filter field
  let filterBy = "title"; 
  // Sort field
  let sortBy = "date_time"; 
  let exactDate = "";
  // Sort order
  let order = "DESC"; 
  // Article list
  let articles = []; 
  let searchWrapper;
  let minScale = 0.85;
  let navbarHeight = 105;
  let isFixed = false;

  onMount(() => {
    const handleScroll = () => {
      if (!searchWrapper) return;
      
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      
      if (scrollPosition > navbarHeight) {
        isFixed = true;
        searchWrapper.style.transform = `scale(${minScale})`;
      } else {
        isFixed = false;
        const scale = Math.max(
          minScale,
          1 - (scrollPosition / navbarHeight) * (1 - minScale)
        );
        searchWrapper.style.transform = `scale(${scale})`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  async function fetchArticles() {
    const queryParams = new URLSearchParams({
      search: searchQuery,
      filterBy,
      sortBy,
      order,
      ...(filterBy === "date_time" && exactDate ? { exactDate } : {})
    });

    console.log("🛠  Sent API request:", `${PUBLIC_API_BASE_URL}/articles?${queryParams}`);

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/articles?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      articles = await response.json();
      console.log(" Retrieved articles:", articles); 
    } catch (error) {
      console.error(" Failed to retrieve article:", error);
    }
  }

  // Fetch article when the component loads
  onMount(fetchArticles);
  onMount(async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/auth/check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      if (response.ok){
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
      console.error(" Failed to retrieve user avatar:", error);
    } 
  });
      

  function handleSearch() {
    if (filterBy === "date_time" && exactDate) {
      let formattedDate = new Date(exactDate).toISOString().split("T")[0];
      console.log("📅 Date passed to the backend:", formattedDate);
      exactDate = formattedDate;
    } else {
      console.log("🔎 Not date filtering, normal query");
    }

   //  **Remove Unicode quotes to prevent invalid characters**
    searchQuery = searchQuery.replace(/[“”„‟❝❞＂]/g, '"').trim();

    fetchArticles();
  }

 // ** Support dynamic switching of search types (title, username, date_time)**
  function handleFilterChange(event) {
    filterBy = event.target.value;
    if (filterBy !== "date_time") {
      // If not searching by date, clear the date selection
      exactDate = ""; 
    }
    fetchArticles();
  }

  // Handle sorting
  function handleSort(event) {
    sortBy = event.target.value;
    fetchArticles();
  }

  // Handle ascending/descending toggle
  function toggleOrder() {
    order = order === "ASC" ? "DESC" : "ASC";
    fetchArticles();
  }
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>



<div class="search-container" class:fixed={isFixed} class:hidden={$displayLogin}>
  <div class="search-wrapper" bind:this={searchWrapper}>
    <div class="search-bar">
      {#if filterBy === "date_time"}
        <span class="date-label">Select date:</span>
        <input type="date" bind:value={exactDate} on:change={handleSearch} />
      {:else}
        <input type="text" bind:value={searchQuery} placeholder="Search..." />
      {/if}
      
      <select bind:value={filterBy} on:change={handleFilterChange}>
        <option value="title">Title</option>
        <option value="username">Username</option>
        <option value="date_time">Date</option>
      </select>

      

      <select bind:value={sortBy} on:change={handleSort}>
        <option value="date_time">Date</option>
        <option value="title">Title</option>
        <option value="username">Username</option>
      </select>

      <button on:click={toggleOrder}>
        {order === "DESC" ? "⬇" : "⬆"}
      </button>

      <button on:click={handleSearch}>Search</button>
    </div>
  </div>
</div>

<div class="articles">
  {#each articles as article}
    <div class="article">
      <a href={`/articles/${article.id}`}>
        <div class="article-content">
          <img src="{PUBLIC_IMAGES_URL}/{article.image_url}" alt={article.title} />
          <h2>{article.title}</h2>
          <div class="article-meta">
            <div>By: {article.username}</div>
            <div>Published on: {article.date_time}</div>
          </div>
          <div class="article-preview">{@html article.content}</div>
        </div>
      </a>
    </div>
  {/each}
</div>

<style>
   .search-container {
    padding: 20px;
    transition: all 0.3s ease;
    z-index: 20;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 800px;
  }

  .hidden {
    display: none;
  }
  
 
  .search-container.fixed {
    position: fixed;
    top: 0;
  }

  .search-wrapper {
    max-width: 800px;
    margin: 0 auto;
    transition: transform 0.3s ease;
    transform-origin: top center;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: white;
    border-radius: 30px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .search-bar input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
  }

  .search-bar select {
    border: none;
    outline: none;
    background: transparent;
    padding: 5px;
    font-size: 14px;
    color: #666;
  }

  .search-bar button {
    background: linear-gradient(90deg, pink, #FFE4E1);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .search-bar button:hover {
    transform: scale(1.05);
  }

  .articles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
    margin-top: 95px;
  }

  .article {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  
}

  .article:hover {
    transform: translateY(-5px) scale(1.02) rotate(0.5deg);
    box-shadow: 0 8px 15px rgba(0,0,0,0.2);
    z-index: 30;
  }


  .article img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

  .article-content {
    padding: 15px;
  }

  .article h2 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 15px;
  margin-bottom: 10px;
}

  .article-meta {
    margin-left: 15px;
    margin-right: 15px;
    color: #666;
    font-size: 0.9em;
  }

  .article-preview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding: 0 15px;
  margin-bottom: 10px;
}

  a {
    text-decoration: none;
    color: inherit;
  }

  @media (max-width: 768px) {
    .search-container.fixed {
      width: 90%;
    }
    
    .search-bar {
      flex-wrap: wrap;
    }
  }

    .date-label {
    color: #666;
    font-size: 14px;
    white-space: nowrap;
    margin-right: 10px;
  }
  
  select {
    padding: 8px 12px;
    border-radius: 15px;
    border: 1px solid #ddd;
    background: rgba(255, 255, 255, 0.8);
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  select:hover {
    border-color: pink;
  }
  
  select:focus {
    outline: none;
    border-color: lightpink;
    box-shadow: 0 0 0 2px rgba(255, 182, 193, 0.2);
  }
</style>