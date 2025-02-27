<script>
    import { onMount } from "svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import Dashboard from "$lib/components/Dashboard.svelte";
    import PledgeManager from "$lib/components/PledgeManager.svelte";
    import UserManager from "$lib/components/UserManager.svelte";
    import Analytics from "$lib/components/Analytics.svelte";
    import { theme } from "$lib/stores/theme.js";

    // Active section state
    let activeSection = "dashboard";

    // Handle section change from sidebar
    function handleSectionChange(event) {
        activeSection = event.detail.section;
    }

    // Initialize theme on mount
    onMount(() => {
        // Check if dark mode is saved in localStorage
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark-theme");
        }
    });
</script>

<div class="admin-layout">
    <Sidebar on:sectionChange={handleSectionChange} />

    <main class="content">
        {#if activeSection === "dashboard"}
            <Dashboard />
        {:else if activeSection === "pledges"}
            <PledgeManager />
        {:else if activeSection === "users"}
            <UserManager />
        {:else if activeSection === "analytics"}
            <Analytics />
        {/if}
    </main>
</div>

<style>
    :global(.dark-theme) {
        /* Dark theme */
        --primary-color: #2a6fc9;
        --secondary-color: #495057;
        --success-color: #1e7e34;
        --warning-color: #d39e00;
        --danger-color: #bd2130;
        --secondary-accent: #3da463;
        --tertiary-accent: #d39e00;
        --text-color: #e1e1e1;
        --text-muted: #adb5bd;
        --card-bg: #2c2c2c;
        --body-bg: #1a1a1a;
        --border-color: #444;
        --hover-bg: #333;
        --selected-bg: #1a3a5f;
        --icon-bg: #333;
        --button-bg: #333;
        --bar-bg: #333;
    }

    :global(body) {
        font-family: var(--font-family);
        margin: 0;
        padding: 0;
        font-size: var(--base-font-size);
    }

    :global(button, input, select, textarea) {
        font-family: var(--font-family);
        font-size: var(--body-font-size);
    }

    :global(h1) {
        font-family: var(--font-family);
        font-weight: 600;
        font-size: var(--heading-font-size);
    }

    :global(h2, h3) {
        font-family: var(--font-family);
        font-weight: 600;
        font-size: var(--subheading-font-size);
    }

    :global(h4, h5, h6) {
        font-family: var(--font-family);
        font-weight: 600;
        font-size: var(--body-font-size);
    }

    :global(p, span, div) {
        font-size: var(--body-font-size);
    }

    :global(.material-symbols-outlined) {
        font-size: 1.5em;
    }

    .admin-layout {
        display: flex;
        min-height: 100vh;
        background-color: var(--body-bg);
        color: var(--text-color);
    }

    .content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
    }

    @media (max-width: 768px) {
        .admin-layout {
            flex-direction: column;
        }
    }
</style>
