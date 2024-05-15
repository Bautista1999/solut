<script>
    import { goto } from "$app/navigation";

    let breadcrumb = {
        link: "",
        title: "",
    };
    /**
     * @type {breadcrumb[]}
     */
    export let breadcrumbs = [];
</script>

{#each breadcrumbs as breadcr}
    <div class="Breadcrumbs">
        <button
            style="cursor: pointer;"
            class="breacrumbButton"
            on:click={() => goto(breadcr.link)}
            >{breadcr.title.substring(
                0,
                20,
            )}{#if breadcr.title.length > 20}...{/if}</button
        >

        {#if breadcrumbs.indexOf(breadcr) != breadcrumbs.length - 1}
            <span class="material-symbols-outlined">
                keyboard_double_arrow_right
            </span>
        {/if}
    </div>
{/each}

<style>
    .Breadcrumbs {
        display: flex;
        justify-content: left;
        text-align: left;
        align-items: center;
        gap: 30px;
    }
    .breacrumbButton {
        background-color: transparent;
        color: var(--secondary-color);
        border: 0px;
        font-family: Barlow;
    }
    .breacrumbButton:hover {
        background-color: transparent;
        color: var(--primary-color);
        border: 0px;
        font-family: Barlow;
    }
</style>
