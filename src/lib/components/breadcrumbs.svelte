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
        <a style="cursor: pointer;" class="breacrumbButton" href={breadcr.link}
            >{breadcr.title.substring(
                0,
                20,
            )}{#if breadcr.title.length > 20}...{/if}</a
        >

        {#if breadcrumbs.indexOf(breadcr) != breadcrumbs.length - 1}
            <a
                class="material-symbols-outlined"
                href={breadcr.link}
                style="text-decoration: none;"
            >
                keyboard_double_arrow_right
            </a>
        {/if}
    </div>
{/each}

<style>
    .Breadcrumbs {
        display: flex;
        justify-content: left;
        text-align: center;
        align-items: center;
        gap: 20px;
        text-decoration: none;
        font-size: medium;
    }
    .breacrumbButton {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        color: var(--secondary-color);
        text-align: center;
        border: 0px;
        font-family: Barlow;
        text-decoration: none;
    }
    .breacrumbButton:hover {
        background-color: transparent;
        color: var(--primary-color);
        border: 0px;
        font-family: Barlow;
        text-decoration: none;
    }
    @media (max-width: 480px) {
        .Breadcrumbs {
            gap: 10px;
        }
    }
</style>
