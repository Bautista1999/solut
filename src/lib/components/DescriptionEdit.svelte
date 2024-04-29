<script>
    import { onMount } from "svelte";
    import BasicButtonSkyBlueSmall from "./BasicButton_SkyBlue_Small.svelte";
    import TutotialMessagePopUp from "./TutotialMessagePopUp.svelte";

    export let active = false;
    export let title = "";
    export let clickToEdit = "(click to edit)";
    let maxLength = 500;

    /**
     * @param {{ target: any; }} event
     */
    function adjustHeight(event) {
        const element = event.target;
        element.style.height = "auto"; // Reset the height so the scroll height can shrink if needed
        element.style.height = `${element.scrollHeight}px`; // Set the height to the scroll height
    }
    onMount((/** @type {{ textarea: { target: any; }; }} */ event) => {
        adjustHeight(event.textarea);
    });

    export let show = false;

    function closeTooltip() {
        show = false;
    }
</script>

<div class="descriptionSection">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class={active ? "" : "EditTextOption"}
        on:click={() => {
            active = true;
        }}
    >
        {#if !active}
            {#if title == ""}
                <p>
                    <span
                        style="font-style: italic;"
                        on:click={(event) => {
                            adjustHeight(event);
                            show = true;
                        }}>Click here to edit the description...</span
                    >
                </p>
            {:else}
                <p style="white-space: pre-wrap;">
                    {title}
                    <span
                        style="font-size:small; font-weight:300; font-style:italic; "
                        >{" " + clickToEdit}</span
                    >
                </p>
            {/if}
        {:else}
            <textarea
                maxlength={maxLength}
                style="width: 100%;
                    height:fit-content;
                    overflow-y: hidden;
            color: var(--secondary-color);
font-family: 'Barlow';
font-size:medium;
line-height: 1.5;  
; 
            "
                name=""
                id=""
                on:input={adjustHeight}
                on:click={adjustHeight}
                bind:value={title}
                placeholder="Include your description here"
                on:keypress={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        active = false; // Deactivate the textarea
                        event.preventDefault(); // Prevent the default Enter behavior (new line)
                        adjustHeight(event); // Adjust the height one last time
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
                <TutotialMessagePopUp
                    title={"About the project"}
                    message={"In the 'about the project' field, you should describe the essence of the challenge you are trying to solve."}
                    {closeTooltip}
                    note={"This is not the place for your ideas. "}
                    topPercentage={70}
                    rightPercentage={2}
                />
            {/if}
            {#if title.length == maxLength}
                <p class="InputErrorMessage">
                    The description cannot be longer than {maxLength} characters.
                </p>
            {:else if title.length > 150}
                <p class="InputWarningMessage">
                    Cant exceed {maxLength} characters. Charecters left: {maxLength -
                        title.length}
                </p>
            {/if}
        {/if}
    </div>
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<style>
    .tooltip {
        position: absolute;
        top: 70%;
        right: 5%;
        transform: translateX(0%);
        padding: 20px;
        color: var(--seventh-color);
        background-color: var(--tertiary-color);
        border: 1px solid var(--sky-blue);
        border-radius: 8px;
        box-shadow: 6px 6px 0px 0px var(--sky-blue);
        display: flex;
        align-items: left;
        justify-content: left;
        flex-direction: column;
        gap: 10px;
        z-index: 100;
    }
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 1,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
        color: var(--sky-blue);
    }
    .descriptionSection {
        border: 1px solid var(--secondary-color);

        height: fit-content;
        padding: 10px;
        margin-top: 3px;
        margin-bottom: 10px;
        font-size: larger;
    }
    .EditTextOption p:hover {
        color: var(--sky-blue);
    }

    textarea {
        height: fit-content;
        resize: none;
    }
</style>
