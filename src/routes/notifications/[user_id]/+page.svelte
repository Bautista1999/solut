<script>
    // @ts-nocheck
    import { onMount } from "svelte";

    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { goto } from "$app/navigation";
    import { path } from "$lib/stores/redirect_store";
    import {
        extractDocumentIdFromURL,
        getUserKey,
        getUserNotifications,
    } from "$lib/data_functions/get_functions";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import { setAllUserNotificationsAsRead } from "../../../declarations/satellite/satellite.api";

    /** @type {import('./$types').PageData} */
    // @ts-ignore
    export let data;
    let key = data.params.user_id;
    let notisLoading = false;

    // This variable will be used to trigger a reload of notifications
    let reloadTrigger = 0;

    // Function to get notifications that can be called multiple times
    const getNotifications = async () => {
        let notifications = await getUserNotifications();
        console.log(notifications);
        return notifications;
    };

    // Function to reload notifications
    const reloadNotifications = () => {
        reloadTrigger += 1;
    };

    /**
     * Groups notifications by date
     * @param {any[]} notifications - Array of notification objects
     * @return {Object} Grouped notifications
     */
    const groupNotificationsByDate = (notifications) => {
        const groups = {};

        notifications.forEach((notification) => {
            const timestamp = Number(
                (notification.created_at == undefined
                    ? 0n
                    : notification.created_at) / 1000000n,
            );

            const date = new Date(timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let groupKey;

            if (date.toDateString() === today.toDateString()) {
                groupKey = "Today";
            } else if (date.toDateString() === yesterday.toDateString()) {
                groupKey = "Yesterday";
            } else {
                groupKey = date.toISOString().split("T")[0];
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }

            groups[groupKey].push(notification);
        });

        return groups;
    };

    /**
     * Check if any notification in a group is unread
     * @param {any[]} notifications - Array of notification objects
     * @return {boolean} True if at least one notification is unread
     */
    const hasUnreadNotification = (notifications) => {
        return notifications.some(
            (notification) => notification.data.read === false,
        );
    };

    /**
     * Format a notification type to determine styling
     * @param {string} title - The notification title
     * @return {string} Type classification
     */
    const getNotificationType = (title) => {
        if (!title) return "default";

        const lowercaseTitle = title.toLowerCase();
        if (
            lowercaseTitle.includes("pledge") &&
            lowercaseTitle.includes("approved")
        )
            return "success";
        if (
            lowercaseTitle.includes("pledge") &&
            lowercaseTitle.includes("rejected")
        )
            return "error";
        if (lowercaseTitle.includes("reputation")) return "info";
        if (lowercaseTitle.includes("follow")) return "follow";
        return "default";
    };

    /**
     * Get the correct URL for a notification
     * @param {Object} notification - Notification object
     * @return {string} The URL to navigate to
     */
    const getNotificationUrl = (notification) => {
        let date = Number(
            (notification.created_at == undefined
                ? 0n
                : notification.created_at) / 1000000n,
        );

        if (
            new Date(date) < new Date("8 July 2024") &&
            !notification.data.linkURL.includes("solution")
        ) {
            // if notification was created before renaming of topics.
            if (notification.data.linkURL.includes("/feature/")) {
                return (
                    "/idea/" +
                    extractDocumentIdFromURL(
                        notification.data.linkURL,
                        "feature",
                    )
                );
            } else if (notification.data.linkURL.includes("/idea/")) {
                return (
                    "/topic/" +
                    extractDocumentIdFromURL(notification.data.linkURL, "idea")
                );
            }
        }

        return notification.data.linkURL
            ? notification.data.linkURL
            : "/profile/" + data.params.user_id;
    };

    onMount(async () => {
        if (!(await CheckIfSignedIn())) {
            path.set("/notifications/" + data.params.user_id);
            goto("/signin");
        }
        if (!((await getUserKey()) != data.params.user_id)) {
            key = await getUserKey();
        }
        setAllUserNotificationsAsRead();
    });

    // Create an array for loading skeletons
    const loadingSkeletons = Array(10).fill(null);
</script>

<svelte:head>
    <meta name="twitter:card" content="summary" />
    <meta charset="utf-8" />
    <title>Notifications</title>
</svelte:head>

<div class="notifications-container">
    <div class="notifications-header">
        <h1>Notifications</h1>
        <button
            class="reload-button"
            on:click={reloadNotifications}
            aria-label="Reload notifications"
        >
            <span class="material-symbols-outlined">refresh</span>
        </button>
    </div>

    <div class="notifications-content">
        {#key reloadTrigger}
            {#await getNotifications()}
                <div class="loading-container">
                    <!-- Skeleton loaders for notifications -->
                    <div class="notification-skeleton-container">
                        {#each loadingSkeletons as _, i}
                            <div class="notification-group">
                                {#if i === 0 || i === 5}
                                    <div class="date-header">
                                        <div
                                            class="date-marker skeleton-pulse"
                                        ></div>
                                        <div
                                            class="skeleton-date-text skeleton-pulse"
                                        ></div>
                                    </div>
                                {/if}

                                <div class="notification-card skeleton-card">
                                    <div
                                        class="notification-image skeleton-pulse"
                                    ></div>
                                    <div class="notification-content">
                                        <div
                                            class="skeleton-title skeleton-pulse"
                                        ></div>
                                        <div
                                            class="skeleton-body skeleton-pulse"
                                        ></div>
                                    </div>
                                    <div class="notification-right">
                                        <div
                                            class="skeleton-time skeleton-pulse"
                                        ></div>
                                        <div
                                            class="skeleton-icon skeleton-pulse"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {:then userNotifications}
                {#if userNotifications.length == 0}
                    <div class="empty-state">
                        <div class="empty-icon">
                            <span class="material-symbols-outlined"
                                >notifications_off</span
                            >
                        </div>
                        <p>You don't have any notifications yet</p>
                    </div>
                {:else}
                    {#each Object.entries(groupNotificationsByDate(userNotifications)) as [dateGroup, notifications]}
                        {@const hasUnread =
                            hasUnreadNotification(notifications)}
                        <div class="notification-group">
                            <div class="date-header">
                                <div
                                    class="date-marker"
                                    class:unread-marker={hasUnread}
                                ></div>
                                <p>{dateGroup}</p>
                            </div>

                            <div class="notification-cards">
                                {#each notifications as notification}
                                    {@const notificationType =
                                        getNotificationType(
                                            notification.data.title,
                                        )}
                                    {@const notificationUrl =
                                        getNotificationUrl(notification)}

                                    <a
                                        href={notificationUrl}
                                        class="notification-card"
                                        class:unread={notification.data.read ===
                                            false}
                                    >
                                        <div class="notification-image">
                                            <img
                                                src={notification.data
                                                    .imageURL ||
                                                    "https://solutio.one/images/ENl0XIiJTV6ThUh96s3Rj.png"}
                                                alt=""
                                                on:error={function (e) {
                                                    if (e && e.target) {
                                                        e.target.src =
                                                            "https://solutio.one/images/ENl0XIiJTV6ThUh96s3Rj.png";
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div class="notification-content">
                                            <div class="title-row">
                                                <h3>
                                                    {notification.data.title}
                                                </h3>
                                                {#if notification.data.read === false}
                                                    <span class="new-badge"
                                                        >New</span
                                                    >
                                                {/if}
                                            </div>

                                            {#if notification.data.subtitle != ""}
                                                <p class="notification-body">
                                                    {notification.data.subtitle.substring(
                                                        0,
                                                        80,
                                                    )}{notification.data
                                                        .subtitle.length > 80
                                                        ? "..."
                                                        : ""}
                                                </p>
                                            {/if}
                                        </div>

                                        <div class="notification-right">
                                            <span class="notification-time">
                                                {new Date(
                                                    Number(
                                                        (notification.created_at ==
                                                        undefined
                                                            ? 0n
                                                            : notification.created_at) /
                                                            1000000n,
                                                    ),
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>

                                            {#if notificationType === "success"}
                                                <span
                                                    class="status-icon success-icon material-symbols-outlined"
                                                    >check_circle</span
                                                >
                                            {:else if notificationType === "error"}
                                                <span
                                                    class="status-icon error-icon material-symbols-outlined"
                                                    >cancel</span
                                                >
                                            {:else if notificationType === "info"}
                                                <span
                                                    class="status-icon info-icon material-symbols-outlined"
                                                    >info</span
                                                >
                                            {:else}
                                                <span
                                                    class="status-icon info-icon material-symbols-outlined"
                                                    >info</span
                                                >
                                            {/if}
                                        </div>
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/each}
                {/if}
            {/await}
        {/key}
    </div>
</div>

<style>
    .notifications-container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .notifications-header {
        margin-bottom: 24px;
        display: flex;
        justify-content: start;
        gap: 10px;
        align-items: center;
    }

    .notifications-header h1 {
        color: var(--secondary-color);
        font-weight: 600;
        font-size: 28px;
        margin: 0;
    }

    .reload-button {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--primary-color);
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .reload-button:hover {
        background-color: var(--forth-color);
        transform: rotate(30deg);
    }

    .reload-button:active {
        transform: rotate(360deg);
    }

    .reload-button span {
        font-size: 24px;
    }

    .notifications-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .loading-container {
        width: 100%;
    }

    /* Skeleton styles */
    .notification-skeleton-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .skeleton-card {
        background-color: var(--tertiary-color);
        box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.7);
        min-height: 80px;
    }

    .skeleton-pulse {
        background: linear-gradient(
            90deg,
            var(--forth-color) 0%,
            var(--ninth-color) 50%,
            var(--forth-color) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
    }

    .skeleton-date-text {
        width: 80px;
        height: 16px;
    }

    .skeleton-title {
        height: 16px;
        width: 70%;
        margin-bottom: 8px;
    }

    .skeleton-body {
        height: 14px;
        width: 90%;
    }

    .skeleton-time {
        height: 14px;
        width: 50px;
        margin-bottom: 8px;
    }

    .skeleton-icon {
        height: 20px;
        width: 20px;
        border-radius: 50%;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 0;
        color: var(--eigth-color);
        gap: 16px;
    }

    .empty-icon {
        font-size: 48px;
    }

    .empty-icon span {
        color: var(--ninth-color);
        font-size: 48px;
    }

    .notification-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .notification-cards {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .date-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .date-marker {
        width: 4px;
        height: 20px;
        background-color: var(--secondary-color);
        border-radius: 0;
    }

    .unread-marker {
        background-color: var(--primary-color);
    }

    .date-header p {
        color: var(--eigth-color);
        font-weight: 500;
        font-size: 16px;
        margin: 0;
        opacity: 0.9;
    }

    .notification-card {
        display: flex;
        position: relative;
        padding: 16px;
        background-color: var(--tertiary-color);
        border: 1px solid var(--seventh-color);
        box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 1);
        border-radius: 8px;
        transition: all 0.2s ease;
        cursor: pointer;
        overflow: hidden;
        align-items: center;
        gap: 16px;
        text-decoration: none;
        color: inherit;
    }

    .unread {
        border-left: 4px solid var(--primary-color);
    }

    .notification-card:not(.unread) {
        border-left: 1px solid var(--seventh-color);
    }

    .notification-card:hover {
        background-color: var(--forth-color);
        transform: translateY(-2px);
    }

    .notification-card:active {
        transform: translateY(0);
        box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
    }

    .notification-image {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        overflow: hidden;
        border: 1px solid var(--seventh-color);
        background-color: var(--forth-color);
    }

    .notification-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .notification-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .notification-content h3 {
        margin: 0;
        font-weight: 600;
        color: var(--secondary-color);
    }

    .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .new-badge {
        font-size: 12px;
        font-weight: 600;
        background-color: var(--green);
        color: white;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
    }

    .notification-body {
        font-size: medium;
        color: var(--eigth-color);
        line-height: 1.4;
        margin: 0;
    }

    .notification-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
    }

    .notification-time {
        font-size: small;
        color: var(--eigth-color);
        white-space: nowrap;
    }

    .status-icon {
        font-size: 20px;
    }

    .success-icon {
        color: var(--green);
    }

    .error-icon {
        color: var(--red-wine);
    }

    .info-icon {
        color: var(--sky-blue);
    }

    /* Responsive design */
    @media (max-width: 700px) {
        .notifications-container {
            padding: 16px;
        }

        .notification-card {
            padding: 12px;
            box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
            gap: 12px;
        }

        .notification-image {
            width: 40px;
            height: 40px;
        }

        .notification-content h3 {
            font-size: 15px;
        }

        .notification-time {
            font-size: 12px;
        }

        .notification-body {
            font-size: 13px;
        }

        .status-icon {
            font-size: 18px;
        }
    }
</style>
