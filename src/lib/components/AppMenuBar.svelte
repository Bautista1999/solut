<script>
    import { goto } from "$app/navigation";
    import { getUserKey } from "$lib/data_functions/get_functions";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { notificationCount } from "$lib/stores/notifications";
    import { IsSignedIn, UserKey } from "$lib/stores/other_stores";
    import { signOut } from "@junobuild/core-peer";

    let active = "";
    $: userKey = getUserKey();
    let menuItems = [
        { name: "home", icon: "home", label: "Home", path: "/" },
        {
            name: "Create",
            icon: "add_circle",
            label: "Create",
            path: "/create",
        },
        { name: "Sign in", icon: "login", label: "Sign in", path: "/signin" },
    ];
    let menuItemsSignedIn = [
        { name: "home", icon: "home", label: "Home", path: "/" },
        {
            name: "Notifications",
            icon: "notifications",
            label: "Notifications",
            path: `/notifications/${$UserKey}`,
        },
        {
            name: "Create",
            icon: "add_circle",
            label: "Create",
            path: "/create",
        },

        {
            name: "Sign out",
            icon: "logout",
            label: "Sign out",
            path: window.location.toString(),
        },
        {
            name: "Account",
            icon: "person",
            label: "Account",
            path: `/account/${$UserKey}`,
        },
    ];
</script>

<nav class="bottom-bar">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    {#each $IsSignedIn ? menuItemsSignedIn : menuItems as item}
        <!-- svelte-ignore empty-block -->
        {#if item.name == "Sign out"}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class:active={active === item.name}
                class="menu-item"
                on:click={async () => {
                    await signOut();
                    CheckIfSignedIn();
                }}
            >
                <span class="material-symbols-outlined">{item.icon}</span>
                <span class="menu-label">{item.label}</span>
            </div>
        {:else if item.name == "Notifications"}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class:active={active === item.name}
                class="menu-item"
                on:click={() => {
                    // active = item.name;
                    goto(item.path + "" + $UserKey);
                }}
            >
                <span class="material-symbols-outlined">{item.icon}</span>
                <span class="menu-label">{item.label}</span>
                {#if $notificationCount > 0}
                    <span class="notification-bell-number"
                        >{$notificationCount}</span
                    >
                {/if}
            </div>
        {:else if item.name == "Account"}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class:active={active === item.name}
                class="menu-item"
                on:click={() => {
                    // active = item.name;
                    goto(item.path + "" + $UserKey);
                }}
            >
                <span class="material-symbols-outlined">{item.icon}</span>
                <span class="menu-label">{item.label}</span>
            </div>
        {:else}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class:active={active === item.name}
                class="menu-item"
                on:click={() => {
                    // active = item.name;
                    goto(item.path);
                }}
            >
                <span class="material-symbols-outlined">{item.icon}</span>
                <span class="menu-label">{item.label}</span>
            </div>
        {/if}
    {/each}
</nav>

<style>
    .bottom-bar {
        position: fixed;
        bottom: 0;
        width: 100%;
        background-color: var(--seventh-color);
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 10px 0;
        /* box-shadow: 0 -4px 5px rgba(0, 0, 0, 0.5); */
        z-index: 3000;
    }

    .menu-item {
        color: var(--tertiary-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
    }

    .menu-item.active {
        color: var(--primary-color);
    }

    .menu-label {
        font-size: 12px;
    }
</style>
