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
    /* overlay */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000; /* 确保弹窗显示在最上层 */
    }
    
    /* Dialog box */
    .modal {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        width: 300px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    /* Message text in the popup */
    .message {
        font-size: 16px;
        margin-bottom: 20px;
    }
    
    /* Button styles */
    .actions {
        display: flex;
        justify-content: space-around;
    }
    
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s ease;
    }
    
    /* Confirm button */
    .confirm {
        background-color: #4CAF50; 
        /* green */
        color: white;
    }
    
    .confirm:hover {
        background-color: #45a049;
    }
    
    /* Cancel button */
    .cancel {
    background-color: #f44336;
    /* red */
    color: white;
    }
    
    .cancel:hover {
        background-color: #e53935;
    }
</style>