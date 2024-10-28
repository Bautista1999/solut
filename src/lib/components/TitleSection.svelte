<script>
    import { UserKey } from "$lib/stores/other_stores";
    import IconButton from "./IconButton.svelte";
    import MagicalDotsSmall from "./MagicalDotsSmall.svelte";

    let editTitle = false;
    let editTitleLoading = false;
    let maxLength = 70;

    /**
     * @type {string}
     */
    export let title;
    export let owner = "";
    export let saveTitleFunction = async () => {};
    export let newTitle = title;
    function onEditTitle() {
        editTitle = true;
    }

    function cancelTitle() {
        newTitle = title;
        editTitle = false;
    }
</script>

<div class="Title">
    {#if !editTitle}
        <h1>{title}</h1>
        {#if owner == $UserKey}
            <div class="actions">
                <IconButton someFunction={onEditTitle} icon={"edit"} />
            </div>
        {/if}
    {:else if !editTitleLoading}
        <div style="width: 100%;">
            <textarea
                maxlength={maxLength}
                name="editedTitle"
                id="editedTitle"
                class="InputText"
                style="width: 100%; font-size: x-large; resize: none; overflow-y: hidden; white-space: pre-wrap; padding:6px; min-height: 1.5em; height: auto; line-height: 1;"
                wrap="soft"
                bind:value={newTitle}
                placeholder={newTitle}
            ></textarea>
            <div class="field">
                <span class="char"
                    >{newTitle.length} / {maxLength} characters</span
                >
            </div>
        </div>

        <div class="actions">
            <IconButton
                icon={"check"}
                someFunction={async () => {
                    if (newTitle == title) {
                        editTitle = false;
                        return;
                    }
                    editTitleLoading = true;
                    await saveTitleFunction();
                    editTitle = false;
                    editTitleLoading = false;
                }}
            />
            <IconButton someFunction={cancelTitle} icon={"close"} />
        </div>
    {:else}
        <div class="editLoading">
            <MagicalDotsSmall />
        </div>
    {/if}
</div>

<style>
    .Title {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    .actions {
        margin-left: auto; /* Pushes the actions to the far end */
        display: flex;
        gap: 10px;
        align-items: center;
    }
    .editLoading {
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto;
        align-self: center;
    }
    .field {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .char {
        font-size: 0.875rem;
        color: var(--primary-color);
        display: block;
        text-align: right;
    }
</style>
