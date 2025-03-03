<script>
    // This component serves as a wrapper that isolates Tailwind styles
    // Only components within this wrapper will be affected by Tailwind
</script>

<div class="tailwind-scope">
    <slot />
</div>

<style>
    /* This wrapper ensures Tailwind styles only apply to components inside it */
    .tailwind-scope {
        /* You can add any specific container styles here */
        width: 100%;
    }
</style>
