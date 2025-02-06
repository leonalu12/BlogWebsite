<script>
    import { createEventDispatcher } from "svelte";
    export let message = "Are you sure?"; // 默认提示语句
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
        <p class="message">{message}</p> <!-- 显示传入的提示语句 -->
        <div class="actions">
            <button class="btn confirm" on:click={confirmDelete}>Confirm</button>
            <button class="btn cancel" on:click={cancelDelete}>Cancel</button>
        </div>
    </div>
</div>

<style>
    /* 遮罩层 */
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
    
    /* 弹窗框 */
    .modal {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        width: 300px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    /* 弹窗中的消息文本 */
    .message {
        font-size: 16px;
        margin-bottom: 20px;
    }
    
    /* 按钮的样式 */
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
    
    /* 确认按钮 */
    .confirm {
        background-color: #4CAF50; /* 绿色 */
        color: white;
    }
    
    .confirm:hover {
        background-color: #45a049;
    }
    
    /* 取消按钮 */
    .cancel {
    background-color: #f44336; /* 红色 */
    color: white;
    }
    
    .cancel:hover {
        background-color: #e53935;
    }
</style>