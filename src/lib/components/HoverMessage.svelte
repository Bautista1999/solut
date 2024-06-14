<script>
    export let message = "This is the hover message!";
</script>

<div class="hover-container" data-message={message}>
    <slot></slot>
</div>

<style>
    .hover-container {
    }

    .hover-container::after {
        content: attr(data-message);
        visibility: hidden;
        background-color: #f9f9f9;
        color: #000;
        text-align: center;
        border-radius: 5px;
        padding: 5px;
        position: absolute;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.3s;
        white-space: nowrap;
        pointer-events: none;
    }

    .hover-container:hover::after {
        visibility: visible;
        opacity: 1;
        top: 100%; /* Position the message below the container */
        left: 50%;
        transform: translateX(-50%);
        margin-top: 10px; /* Adjust the gap between the container and the message */
    }
</style>
