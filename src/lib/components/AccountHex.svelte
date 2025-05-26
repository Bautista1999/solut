<script>
    export let value = "";
    let copied = false;
    let copy = () => {
        navigator.clipboard.writeText(value);
        copied = true;
        setTimeout(() => {
            copied = false;
        }, 2000);
    };
</script>

<div style="display: flex; align-items: center; gap: 0.25rem;">
    <a
        href={`https://dashboard.internetcomputer.org/account/${value}`}
        target="_blank"
        rel="noopener noreferrer"
        class="account-hex"
    >
        {value.slice(0, 4)}...{value.slice(-4)}
    </a>
    <button class="copy-button" on:click={copy}>
        <span class="material-symbols-outlined">content_copy</span>
    </button>
</div>
{#if copied}
    <p class="copied-text">Copied!</p>
{/if}

<style>
    .material-symbols-outlined {
        font-size: 1rem;
    }
    .account-hex {
        font-size: 0.875rem;
    }
    .copy-button {
        background-color: transparent;
        border: none;
        cursor: pointer;
        font-size: 0.5rem;
    }
    .copied-text {
        position: absolute;
        font-size: 0.75rem;
        color: var(--primary-color);
        transform: translateY(-120%) translateX(265%);
    }
</style>
