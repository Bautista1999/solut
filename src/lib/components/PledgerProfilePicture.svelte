<script>
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { onMount } from "svelte";

    export let image;
    export let index;

    const defaultSrc =
        "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png";
    /**
     * @param {{ stopPropagation: () => void; }} event
     */
    // function handleProfileClick(event) {
    //     // Stop the click event from bubbling up to parent elements
    //     event.stopPropagation();

    //     // Your logic for when the profile picture is clicked
    //     goto("/profile/" + userKey);
    // }
    $: displaySrc = image || defaultSrc;
    onMount(async () => {
        displaySrc = await validateImageUrl(displaySrc, defaultSrc);
    });
</script>

<img src={displaySrc} alt={`Image number ${index + 1}`} />

<style>
    img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Ensure images cover the container without distortion */
    }
</style>
