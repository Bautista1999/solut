<script>
    import TutotialMessagePopUp from "./TutotialMessagePopUp.svelte";

    export let active = false;
    export let title = "";
    export let clickToEdit = "(click to edit)";
    export let noTitle = false;

    export let show = false;
    export let messageTitle = "Here type the title of the challenge.";

    function closeTooltip() {
        show = false;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class={active ? "" : "EditTextOption"}
    style="width:100%;background-color: {noTitle ? 'var(--fifth-color)' : ''}"
    on:click={() => {
        active = true;
    }}
>
    {#if !active}
        {#if title == ""}
            <h1
                style="font-style: italic; margin:0px"
                on:click={(event) => {
                    show = true;
                }}
            >
                Click here to edit the title...
            </h1>
            {#if noTitle}
                <p class="InputErrorMessage">ERROR: Title required.</p>
            {/if}
        {:else}
            <h1>
                {title}
                <span
                    style="font-size:medium; font-weight:300; font-style:italic;"
                    >{" " + clickToEdit}</span
                >
            </h1>
        {/if}
    {:else}
        <textarea
            maxlength="70"
            style="width:96%;
                        height:fit-content;
                        overflow-y: hidden;
                color: var(--secondary-color);
    font-family: 'Barlow';
    font-size:x-large;
    font-style:normal; 
    font-weight:600;
    padding: 5px; 
    line-height: 1.5;  
    ; 
                "
            name=""
            id=""
            bind:value={title}
            placeholder="Include your title here"
            on:keypress={(event) => {
                if (event.key == "Enter") {
                    active = false;
                }
            }}
        />
        <span
            class="material-symbols-outlined"
            style="margin-top: 0px; align-self:flex-start; cursor:pointer;"
            on:click={() => {
                show = !show;
            }}
        >
            help
        </span>
        {#if show}
            <div class="message-pop-up">
                <TutotialMessagePopUp
                    title={"Title"}
                    message={messageTitle +
                        " The title max characters is 70, for SEO optimization."}
                    {closeTooltip}
                    topPercentage={12}
                    rightPercentage={12}
                />
            </div>
        {/if}
        {#if title.length == 70}
            <p class="InputErrorMessage">
                The title cannot be longer than 70 characters.
            </p>
        {:else if title.length > 40}
            <p class="InputWarningMessage">
                Cant exceed 70 characters. Characters left: {70 - title.length}
            </p>
        {/if}
    {/if}
</div>

<style>
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 1,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
        color: var(--sky-blue);
    }
    @media (max-width: 480px) {
        .message-pop-up {
            display: none;
        }
    }
</style>
