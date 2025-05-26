<script>
    import { onMount } from "svelte";
    import { getDoc } from "@junobuild/core";

    /**
     * @type {"idea" | "feature"}
     */
    export let type;

    /**
     * @type {string}
     */
    export let id;

    /**
     * @type {any}
     */
    let elementData = null;
    let isLoading = true;
    /**
     * @type {string | null}
     */
    let error = null;

    // Default images based on type
    const defaultImages = {
        idea: "https://solutio.one/solutio-images/logo-01.png",
        feature: "https://solutio.one/solutio-images/logo-01.png",
    };

    /**
     * @param {string} idea_id
     */
    async function getIdeaInfo(idea_id) {
        try {
            const idea = await getDoc({
                collection: "idea",
                key: idea_id,
            });
            return idea;
        } catch (err) {
            console.error("Error fetching idea:", err);
            return null;
        }
    }

    /**
     * @param {string} feature_id
     */
    async function getFeatureInfo(feature_id) {
        try {
            const feature = await getDoc({
                collection: "feature",
                key: feature_id,
            });
            return feature;
        } catch (err) {
            console.error("Error fetching feature:", err);
            return null;
        }
    }

    onMount(async () => {
        console.log("ElementHoveredTable mounted with type:", type, "id:", id);
        if (!id) {
            error = "No ID provided";
            isLoading = false;
            return;
        }

        try {
            if (type === "idea") {
                elementData = await getIdeaInfo(id);
                console.log("Idea data loaded:", elementData);
            } else if (type === "feature") {
                elementData = await getFeatureInfo(id);
                console.log("Feature data loaded:", elementData);
            } else {
                error = "Invalid type";
            }
        } catch (err) {
            error = "Failed to load data";
            console.error("Error in ElementHoveredTable:", err);
        } finally {
            isLoading = false;
            console.log("Loading complete, state:", {
                elementData,
                error,
                isLoading,
            });
        }
    });
</script>

<div class="hover-card">
    {#if isLoading}
        <div class="hover-card-loading">
            <div class="skeleton-header">
                <div class="skeleton-image"></div>
                <div class="skeleton-title"></div>
            </div>
            <div class="skeleton-subtitle"></div>
        </div>
    {:else if error}
        <div class="error-container">
            <span class="material-symbols-outlined">error_outline</span>
            <p>{error}</p>
        </div>
    {:else if elementData}
        <div class="hover-card-content">
            <div class="element-header">
                <!-- Small square image on the left -->
                <div class="element-image">
                    {#if elementData.data.images[0]}
                        <img
                            src={elementData.data.images[0]}
                            alt={elementData.title || "Element image"}
                        />
                    {:else}
                        <img
                            src={defaultImages[type]}
                            alt={type === "idea"
                                ? "Default idea image"
                                : "Default feature image"}
                            class="default-image"
                        />
                    {/if}
                </div>
                <!-- Title on the right -->
                <h3 class="element-title">
                    {elementData.data.title || "Untitled"}
                </h3>
            </div>

            <!-- Subtitle underneath -->
            <p class="element-subtitle">
                {elementData.data.subtitle?.slice(0, 100) || "No description"}
                {#if elementData.description && elementData.description.length > 100}...{/if}
            </p>
        </div>
    {:else}
        <div class="error-container">
            <span class="material-symbols-outlined">info</span>
            <p>No data available</p>
        </div>
    {/if}
</div>

<style>
    .hover-card {
        position: absolute;
        z-index: 9999;
        width: 280px; /* Slightly smaller width */
        background-color: var(--tertiary-color);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        padding: 10px; /* Add padding inside the card */
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        transform-origin: bottom center;
    }

    .hover-card-content {
        display: flex;
        flex-direction: column;
    }

    /* Header with image and title side by side */
    .element-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
    }

    .element-image,
    .skeleton-image {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background-color: var(--secondary-color, #f5f5f5);
        overflow: hidden;
        flex-shrink: 0; /* Prevent image from shrinking */
    }

    .element-image img,
    .default-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .placeholder-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--secondary-color-v2, #f0f0f0);
    }

    .placeholder-image span {
        font-size: 24px; /* Smaller icon for smaller image */
        color: var(--primary-color, #333);
        opacity: 0.5;
    }

    .element-title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--primary-color, #333);
        /* Allow title to wrap and take remaining space */
        flex-grow: 1;
    }

    .element-subtitle {
        font-size: 0.85rem;
        color: var(--text-color, #666);
        line-height: 1.4;
    }

    /* Loading skeleton styles */
    .hover-card-loading {
        display: flex;
        flex-direction: column;
    }

    .skeleton-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
    }

    .skeleton-title,
    .skeleton-subtitle,
    .skeleton-image,
    .skeleton-date {
        background: linear-gradient(
            90deg,
            var(--skeleton-start, #f0f0f0) 0%,
            var(--skeleton-end, #e0e0e0) 50%,
            var(--skeleton-start, #f0f0f0) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
    }

    .skeleton-title {
        height: 20px;
        width: 75%;
        flex-grow: 1;
    }

    .skeleton-subtitle {
        height: 14px;
        width: 100%;
        margin-bottom: 12px;
    }

    .skeleton-date {
        height: 12px;
        width: 70%;
        margin-top: 8px;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    /* Error styles */
    .error-container {
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--danger-color, #dc3545);
        text-align: center;
        background-color: #fff3f3;
        min-height: 80px;
    }

    .error-container span {
        font-size: 28px;
        margin-bottom: 8px;
    }

    .error-container p {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .default-image {
        /* Add any specific styling for default images */
        opacity: 0.9;
    }

    @keyframes popIn {
        0% {
            opacity: 0;
            transform: scale(0.6) translateY(70px);
        }
        70% {
            transform: scale(1.05) translateY(-90px);
        }
        100% {
            opacity: 1;
            transform: scale(1) translateY(-100px);
        }
    }
</style>
