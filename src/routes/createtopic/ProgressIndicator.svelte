<script>
    export let progress = 0;
</script>

<div class="progress-bar">
    <div
        class="progress"
        style="width: {progress}%; background-color:{progress == 100
            ? 'green'
            : 'var(--primary-color)'}"
    ></div>
</div>

<style>
    .progress-bar {
        width: 100%;
        height: 10px;
        background-color: var(--forth-color);
        margin-bottom: 20px;
        border-radius: 5px;
    }

    .progress {
        height: 100%;
        background-color: var(--primary-color);
        border-radius: 5px;
        transition: width 0.3s ease-in-out;
    }
</style>
