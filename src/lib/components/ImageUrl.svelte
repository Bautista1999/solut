<script>
    import { validateImageUrl } from "$lib/data_functions/get_functions";
    import { onMount } from "svelte";

    export let src = "";
    $: displaySrc = src;
    onMount(async () => {
        if (displaySrc != "" && displaySrc != undefined) {
            console.log(displaySrc);
            displaySrc = await validateImageUrl(
                displaySrc,
                "https://resource.rentcafe.com/image/upload/q_auto,f_auto,c_limit,w_576,h_500/s3/2/50552/image%20not%20available(12).jpg",
            );
        } else {
            displaySrc =
                "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
        }
    });
</script>

<img alt="Scroller Image" src={displaySrc} />

<style>
    img {
        width: 100%; /* Make the image fill the width */
        height: 100%; /* Make the image fill the height */
        object-fit: cover; /* Cover the container, cropping where necessary */
        display: block; /* Prevent inline default spacing */
    }
</style>
