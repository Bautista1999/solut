<script>
    import { goto } from "$app/navigation";
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { onMount } from "svelte";

    // You can pass the image source as a prop if it needs to be dynamic
    export let src = "";
    export let userKey = "";
    const defaultSrc =
        "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png";
    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    function handleProfileClick(event) {
        // Stop the click event from bubbling up to parent elements
        event.stopPropagation();

        // Your logic for when the profile picture is clicked
        goto("/profile/" + userKey);
    }
    $: displaySrc = src || defaultSrc;
    onMount(async () => {
        displaySrc = await validateImageUrl(displaySrc, defaultSrc);
    });
</script>

<img
    src={displaySrc}
    alt="Profile Picture"
    class="idea-card-profile-picture"
    on:click={handleProfileClick}
/>
