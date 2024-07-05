<script>
    import TutotialMessagePopUp from "./TutotialMessagePopUp.svelte";

    export let active = false;
    export let title = "";
    export let clickToEdit = "(click to edit)";
    export let noSubtitle = false;
    let maxLength = 200;
    export let show = false;
    export let messageSubtitle = "Here type the subtitle of the challenge.";

    function closeTooltip() {
        show = false;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class={active ? "" : "EditTextOption"}
    style="background-color: {noSubtitle ? 'var(--fifth-color)' : ''}"
    on:click={() => {
        active = true;
    }}
>
    {#if !active}
        {#if title == ""}
            <span
                style="font-style: italic;"
                on:click={() => {
                    show = !show;
                }}>Click here to edit the subtitle...</span
            >
            <br />
            {#if noSubtitle}
                <p class="InputErrorMessage">ERROR: Subtitle required.</p>
            {/if}
        {:else}
            {title}
            <span style="font-size:small; font-weight:300; font-style:italic;"
                >{" " + clickToEdit}</span
            >
        {/if}
    {:else}
        <textarea
            maxlength={maxLength}
            style=" width:96%;
                    height:fit-content;
                    overflow-y: hidden;
            color: var(--secondary-color);
font-family: 'Barlow';
font-size:medium;

padding: 5px; 
line-height: 1.5;  
; 
            "
            name=""
            id=""
            bind:value={title}
            placeholder="Include your subtitle here"
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
                    title={"Subtitle"}
                    message={messageSubtitle +
                        " The title max characters is 200, for SEO optimization."}
                    {closeTooltip}
                    topPercentage={17}
                    rightPercentage={12}
                />
            </div>
        {/if}
        {#if title.length == maxLength}
            <p class="InputErrorMessage">
                The title cannot be longer than {maxLength} characters.
            </p>
        {:else if title.length > 150}
            <p class="InputWarningMessage">
                Cant exceed {maxLength} characters. Characters left: {maxLength -
                    title.length}
            </p>
        {/if}
    {/if}
</div>

<style>
    .EditTextOption p:hover {
        color: var(--sky-blue);
    }
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
