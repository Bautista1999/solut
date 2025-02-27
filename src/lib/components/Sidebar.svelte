<script>
    import { createEventDispatcher } from "svelte";
    import { theme, toggleTheme } from "$lib/stores/theme.js";
    import { fly, scale, fade } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    // Create event dispatcher
    const dispatch = createEventDispatcher();

    // Active section state
    let activeSection = "dashboard";

    // Handle section selection
    function handleSelect(section) {
        activeSection = section;
        dispatch("sectionChange", { section });
    }

    // Theme toggle with animation
    function handleThemeToggle() {
        toggleTheme();
    }
</script>

<svelte:head>
    <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap"
        rel="stylesheet"
    />
    <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
    />
</svelte:head>

<aside class="sidebar">
    <div class="logo" in:fly={{ y: -20, duration: 300, delay: 100 }}>
        <img
            src="http://localhost:5173/assets/LogoSol3.png"
            alt="Solutio Logo"
        />
        <h1>Solutio</h1>
    </div>

    <nav class="navigation" in:fly={{ y: -10, duration: 300, delay: 200 }}>
        <ul>
            <li>
                <button
                    class:active={activeSection === "dashboard"}
                    on:click={() => handleSelect("dashboard")}
                >
                    <span class="material-symbols-outlined">dashboard</span>
                    <span class="label">Dashboard</span>
                    {#if activeSection === "dashboard"}
                        <span
                            class="active-indicator"
                            in:scale={{ duration: 200, start: 0.5 }}
                        ></span>
                    {/if}
                </button>
            </li>
            <li>
                <button
                    class:active={activeSection === "pledges"}
                    on:click={() => handleSelect("pledges")}
                >
                    <span class="material-symbols-outlined">payments</span>
                    <span class="label">Pledges</span>
                    {#if activeSection === "pledges"}
                        <span
                            class="active-indicator"
                            in:scale={{ duration: 200, start: 0.5 }}
                        ></span>
                    {/if}
                </button>
            </li>
            <li>
                <button
                    class:active={activeSection === "users"}
                    on:click={() => handleSelect("users")}
                >
                    <span class="material-symbols-outlined">group</span>
                    <span class="label">Users</span>
                    {#if activeSection === "users"}
                        <span
                            class="active-indicator"
                            in:scale={{ duration: 200, start: 0.5 }}
                        ></span>
                    {/if}
                </button>
            </li>
            <li>
                <button
                    class:active={activeSection === "analytics"}
                    on:click={() => handleSelect("analytics")}
                >
                    <span class="material-symbols-outlined">monitoring</span>
                    <span class="label">Analytics</span>
                    {#if activeSection === "analytics"}
                        <span
                            class="active-indicator"
                            in:scale={{ duration: 200, start: 0.5 }}
                        ></span>
                    {/if}
                </button>
            </li>
        </ul>
    </nav>

    <div class="theme-toggle" in:fly={{ y: -10, duration: 300, delay: 300 }}>
        <button on:click={handleThemeToggle} class="theme-button">
            <span class="material-symbols-outlined theme-icon">
                {$theme === "light" ? "dark_mode" : "light_mode"}
            </span>
            <span class="label"
                >{$theme === "light" ? "Dark Mode" : "Light Mode"}</span
            >
        </button>
    </div>

    <div class="user-info" in:fly={{ y: -10, duration: 300, delay: 400 }}>
        <div class="avatar">
            <span class="material-symbols-outlined">person</span>
        </div>
        <div class="user-details">
            <p class="user-name">Admin User</p>
            <p class="user-role">Administrator</p>
        </div>
    </div>
</aside>

<style>
    :global(body) {
        font-family: "Barlow", sans-serif;
    }

    .sidebar {
        width: 250px;
        background-color: var(--primary-color, #4a90e2);
        color: white;
        display: flex;
        flex-direction: column;
        height: 100vh;
        position: sticky;
        top: 0;
        font-family: "Barlow", sans-serif;
    }

    .logo {
        padding: 20px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo img {
        width: 45px;
        height: 45px;
        margin-right: 12px;
        transition: transform 0.3s ease;
    }

    .logo:hover img {
        transform: scale(1.05);
    }

    .logo h1 {
        margin: 0;
        font-size: 1.7rem;
        font-weight: 600;
        font-family: "Barlow", sans-serif;
    }

    .navigation {
        flex: 1;
        padding: 20px 0;
    }

    .navigation ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .navigation li {
        margin-bottom: 8px;
        position: relative;
    }

    .navigation button {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 14px 20px;
        background: none;
        border: none;
        color: white;
        text-align: left;
        cursor: pointer;
        font-size: 1.1rem;
        transition: all 0.2s ease;
        border-radius: 4px;
        font-family: "Barlow", sans-serif;
        position: relative;
        overflow: hidden;
    }

    .navigation button:hover,
    .theme-button:hover {
        background-color: rgba(255, 255, 255, 0.15);
        transform: translateX(3px);
    }

    .navigation button.active {
        background-color: rgba(255, 255, 255, 0.2);
        font-weight: 600;
    }

    .active-indicator {
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        background-color: white;
        border-radius: 0 2px 2px 0;
    }

    .material-symbols-outlined {
        margin-right: 12px;
        font-size: 1.5em;
    }

    .theme-toggle {
        padding: 0 20px 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .theme-button {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 14px 20px;
        background: none;
        border: none;
        color: white;
        text-align: left;
        cursor: pointer;
        font-size: 1.1rem;
        transition: background-color 0.2s;
        border-radius: 4px;
        margin-top: 10px;
        font-family: "Barlow", sans-serif;
        position: relative;
        overflow: hidden;
    }

    .theme-button:after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 5px;
        height: 5px;
        background: rgba(255, 255, 255, 0.5);
        opacity: 0;
        border-radius: 100%;
        transform: scale(1, 1) translate(-50%);
        transform-origin: 50% 50%;
    }

    .theme-button:focus:not(:active)::after {
        animation: ripple 1s ease-out;
    }

    @keyframes ripple {
        0% {
            transform: scale(0, 0);
            opacity: 0.5;
        }
        20% {
            transform: scale(25, 25);
            opacity: 0.3;
        }
        100% {
            opacity: 0;
            transform: scale(40, 40);
        }
    }

    .theme-icon {
        transition: transform 0.3s ease;
    }

    .theme-button:hover .theme-icon {
        transform: rotate(180deg);
    }

    .user-info {
        padding: 20px;
        display: flex;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }

    .avatar:hover {
        transform: scale(1.05);
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    }

    .avatar .material-symbols-outlined {
        font-size: 1.6em;
        margin-right: 0;
    }

    .user-details {
        flex: 1;
    }

    .user-name {
        margin: 0;
        font-weight: 600;
        font-family: "Barlow", sans-serif;
        font-size: 1.1rem;
    }

    .user-role {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.8;
        font-family: "Barlow", sans-serif;
    }

    @media (max-width: 768px) {
        .sidebar {
            width: 100%;
            height: auto;
            position: relative;
        }

        .navigation {
            padding: 10px 0;
        }

        .navigation ul {
            display: flex;
            flex-wrap: wrap;
        }

        .navigation li {
            flex: 1;
            min-width: 120px;
            margin-bottom: 0;
        }

        .navigation button {
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 10px;
            text-align: center;
        }

        .navigation .material-symbols-outlined {
            margin-right: 0;
            margin-bottom: 5px;
        }

        .theme-toggle,
        .user-info {
            display: none;
        }
    }
</style>
