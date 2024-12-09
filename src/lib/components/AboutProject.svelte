<script>
    import { UserKey } from "$lib/stores/other_stores";
    import IconButton from "./IconButton.svelte";
    import MagicalDotsSmall from "./MagicalDotsSmall.svelte";
    import QuillTextEditor from "./QuillTextEditor.svelte";

    export let description = "";

    let editDescription = false;
    let editDescriptionLoading = false;
    let maxLength = 3000;

    export let saveDescriptionFunction = async () => {};
    export let newDescription = description;
    function onEditDescription() {
        editDescription = true;
    }

    function cancelDescription() {
        newDescription = description;
        editDescription = false;
    }
    export let owner = "";
</script>

{#if !editDescription}
    <div class="descriptionSection">
        <p class="descriptionText">{@html description}</p>
        {#if owner == $UserKey}
            <div class="iconContainer">
                <IconButton
                    someFunction={() => {
                        onEditDescription();
                    }}
                    icon={"edit"}
                />
            </div>
        {/if}
    </div>
{:else if !editDescriptionLoading}
    <div class="descriptionEditingSection">
        <!-- <textarea
            name="editedTitle"
            maxlength={maxLength}
            id="editedTitle"
            class="InputText textArea"
            wrap="soft"
            bind:value={newDescription}
            placeholder={newDescription}
        ></textarea> -->
        <QuillTextEditor
            maxCharacters={maxLength}
            bind:description={newDescription}
        />
        {#if editDescription}
            <div class="field">
                <span class="char"
                    >{newDescription.length} / {maxLength} characters</span
                >
            </div>
        {/if}
        <div class="actions">
            <IconButton
                icon={"check"}
                someFunction={async () => {
                    if (newDescription == description) {
                        editDescription = false;
                        return;
                    }
                    if (newDescription.length > maxLength) {
                        alert(
                            "ERROR: The description is exceeding the maximum amount of characters.",
                        );
                        return;
                    }
                    editDescriptionLoading = true;
                    await saveDescriptionFunction();
                    editDescription = false;
                    editDescriptionLoading = false;
                }}
            />
            <IconButton someFunction={cancelDescription} icon={"close"} />
        </div>
    </div>
{:else}
    <div class="editLoading">
        <MagicalDotsSmall />
    </div>
{/if}

<style>
    .descriptionSection {
        border: 1px solid var(--secondary-color);
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: fit-content;
        padding: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        max-width: 100%;
        overflow-x: hidden;

        /* Add these two lines to handle long words */
        word-wrap: break-word; /* Older version, ensures long words are broken */
        word-break: break-word; /* Modern browsers, ensures words break */
    }
    .descriptionEditingSection {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: fit-content;
    }

    .descriptionText {
        margin: 0;
    }

    .iconContainer {
        align-self: flex-end; /* Aligns the IconButton to the far right */
        margin-top: 10px; /* Optional spacing between text and button */
    }

    .actions {
        display: flex;
        gap: 10px;
        align-self: flex-end; /* Aligns the check and close buttons to the far right */
        margin-top: 10px;
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
    .textArea {
        width: 100%;
        font-size: medium;
        resize: none;
        overflow-y: auto; /* Enables vertical scrollbar when content overflows */
        white-space: pre-wrap;
        box-sizing: border-box; /* Ensures padding is within width */
        padding: 6px;
        height: 300px;
    }
    @media (max-width: 700px) {
        .textArea {
            min-height: 2em;
            line-height: 1;
        }
    }
</style>
