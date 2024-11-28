<script>
    /**
     * @type {string | any[]}
     */
    export let notifications = [];
    export let show = false; // Controls visibility
    const defaultImage =
        "https://svftd-daaaa-aaaal-adr3a-cai.icp0.io/solutio-images/logo-01.png";
</script>

<div class="popup-container {show ? 'show' : ''}">
    {#if notifications.length > 0}
        {#each notifications as notification}
            <div class="notification-item">
                <img
                    src={`${notification.data.imageURL}?nocache=${Date.now()}`}
                    alt={notification.title}
                    class="notification-image"
                    on:error={(e) => {
                        const img = e.currentTarget;
                        if (img instanceof HTMLImageElement) {
                            img.src = defaultImage;
                        }
                    }}
                    on:load={(e) => {
                        const img = e.currentTarget;
                        if (
                            img instanceof HTMLImageElement &&
                            (img.naturalWidth === 0 || img.naturalHeight === 0)
                        ) {
                            img.src = defaultImage;
                        }
                    }}
                />

                <div class="notification-content">
                    <p class="notification-title">{notification.data.title}</p>
                    <p class="notification-subtitle">
                        {notification.data.subtitle}
                    </p>
                </div>
            </div>
        {/each}
    {:else}
        <div class="no-notifications">No new notifications available</div>
    {/if}
</div>

<style>
    .popup-container {
        position: fixed;
        left: 100px;
        /* transform: translateX(4000px);
        transform: translateY(100px); */
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background-color: var(--tertiary-color);
        /* border: 1px solid var(--seventh-color); */
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        opacity: 0;
        transform: translateY(-10px);

        z-index: 1000;
        pointer-events: none; /* Prevent interaction when hidden */
        font-size: normal;
        font-style: normal;
        font-weight: normal;
        line-height: normal;
    }

    .popup-container.show {
        opacity: 1;
        transform: translateY(0);

        pointer-events: auto; /* Enable interaction when visible */
    }

    .notification-item {
        display: flex;
        padding: 8px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.21);
        align-items: center;
    }

    .notification-item:last-child {
        border-bottom: none;
    }

    .notification-image {
        width: 54px;
        height: 54px;
        border-radius: 4px;
        margin-right: 10px;
        object-fit: cover;
    }

    .notification-content {
        flex: 1;
    }

    .notification-title {
        font-weight: bold;
        margin: 0;
        color: var(--primary-color);
    }

    .notification-subtitle {
        margin: 4px 0 0;
        font-size: 0.9rem;
        color: var(--secondary-color);
    }

    .no-notifications {
        padding: 16px;
        text-align: center;
        color: var(--secondary-color);
        font-style: italic;
    }
</style>
