<script>
  import { createEventDispatcher } from 'svelte';
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  
  const dispatch = createEventDispatcher();
  
  const predefinedAvatars = [
    '1739143411474.JPG',
    'avatar2.png',
    'avatar3.png',
    'avatar4.png',
    'avatar5.png'
  ];
  
  let selectedAvatar = predefinedAvatars[0];
  let customImage = null;
  let previewUrl = `${PUBLIC_IMAGES_URL}/${selectedAvatar}`;
  
  function handleAvatarSelect(avatar) {
    selectedAvatar = avatar;
    previewUrl = `${PUBLIC_IMAGES_URL}/${avatar}`;
    dispatch('select', { avatar, type: 'predefined' });
  }
  
  function handleCustomImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      customImage = file;
      previewUrl = URL.createObjectURL(file);
      dispatch('select', { avatar: file, type: 'custom' });
    }
  }
  
  function handleNext() {
    dispatch('next');
  }
</script>

<div class="avatar-container">
  <div class="avatar-header">
    <p class="avatar-title">Choose Your Avatar</p>
  </div>
  
  <div class="preview-container">
    <img src={previewUrl} alt="Selected avatar" class="preview-avatar"/>
  </div>
  
  <div class="avatars-grid">
    {#each predefinedAvatars as avatar}
      <button 
        type="button"
        class="avatar-option" 
        class:selected={selectedAvatar === avatar}
        on:click={() => handleAvatarSelect(avatar)}
        on:keydown={(e) => e.key === 'Enter' && handleAvatarSelect(avatar)}
      >
        <img src={`${PUBLIC_IMAGES_URL}/${avatar}`} alt="Avatar option"/>
      </button>
    {/each}
    
    <div class="avatar-option upload-option">
      <label for="custom-avatar">
        <span class="upload-icon">+</span>
        <input
          type="file"
          id="custom-avatar"
          accept="image/*"
          on:change={handleCustomImageUpload}
          style="display: none;"
        />
      </label>
    </div>
  </div>
  
  <button class="next-btn" on:click={handleNext}>Next</button>
</div>

<style>
  .avatar-container {
    width: 35%;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: lightpink;
    opacity: 0.9;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 11;
  }

  .avatar-header {
    text-align: center;
    border-bottom: 1px solid #9c9b9b;
    padding-bottom: 10px;
  }

  .avatar-title {
    font-size: 15px;
    font-weight: bold;
    margin: 0;
    font-family: "Arial", sans-serif;
  }

  .preview-container {
    text-align: center;
    margin: 20px 0;
  }

  .preview-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid white;
  }

  .avatars-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin: 20px 0;
  }

  .avatar-option {
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: transform 0.2s;
  }

  .avatar-option:hover {
    transform: scale(1.05);
  }

  .avatar-option.selected {
    border-color: white;
  }

  .avatar-option img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-option {
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upload-icon {
    font-size: 40px;
    color: white;
  }

  .next-btn {
    width: 100%;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 10px;
    background: linear-gradient(90deg, pink, #FFE4E1);
    height: 50px;
    font-size: 16px;
    margin-top: 20px;
  }
</style>