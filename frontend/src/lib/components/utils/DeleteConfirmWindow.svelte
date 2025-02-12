<script>
    import { createEventDispatcher } from "svelte";
    export let message = "Are you sure?";
    // Default prompt message
    const dispatch = createEventDispatcher();
     
    const confirmDelete = () => {
    dispatch('confirm');
    };
    
    const cancelDelete = () => {
        dispatch('cancel');
    };
</script>

<div class="overlay">
    <div class="modal">
        <p class="message">{message}</p>
        <!-- Display the provided prompt message -->
        <div class="actions">
            <button class="btn confirm" on:click={confirmDelete}>Confirm</button>
            <button class="btn cancel" on:click={cancelDelete}>Cancel</button>
        </div>
    </div>
</div>

<style>
  .overlay {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    z-index: 9999;
  }

  .modal {
    background: white;
    padding: 20px;
    border-radius: 15px;
    width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
    transition: all 0.3s ease;
    z-index: 10000;
  }

  .modal:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }

  .message {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
    font-size: 1rem;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .confirm {
    background: linear-gradient(90deg, pink, #FFE4E1);

    color: white;
  }

  .confirm:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

.confirm {
  background: linear-gradient(90deg, pink, #FFE4E1);
  color: white;
  transition: all 0.2s ease;
}

.confirm:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel {
  background: linear-gradient(90deg, pink, #FFE4E1);
  color:white;
  transition: all 0.2s ease;
}

.cancel:hover {
  transform: scale(1.05); 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>