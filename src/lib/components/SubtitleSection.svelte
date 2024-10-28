<script>
    import { UserKey } from "$lib/stores/other_stores";
    import IconButton from "./IconButton.svelte";
    import MagicalDotsSmall from "./MagicalDotsSmall.svelte";

    let editSubtitle = false;
    let editSubtitleLoading = false;
    let maxLength = 200;
    /**
     * @type {string}
     */
    export let subtitle;
    export let owner = "";
    export let saveSubtitleFunction = async () => {};
    export let newSubtitle = subtitle;
    function onEditSubtitle() {
        editSubtitle = true;
    }

    function cancelSubtitle() {
        newSubtitle = subtitle;
        editSubtitle = false;
    }
</script>

<div class="Subtitle">
    {#if !editSubtitle}
        <div>{subtitle}</div>
        {#if owner == $UserKey}
            <div class="actions">
                <IconButton someFunction={onEditSubtitle} icon={"edit"} />
            </div>
        {/if}
    {:else if !editSubtitleLoading}
        <textarea
            name="editedTitle"
            maxlength={maxLength}
            id="editedTitle"
            class="InputText textArea"
            wrap="soft"
            bind:value={newSubtitle}
            placeholder={newSubtitle}
        ></textarea>
        <div class="actions">
            <IconButton
                icon={"check"}
                someFunction={async () => {
                    if (newSubtitle == subtitle) {
                        editSubtitle = false;
                        return;
                    }
                    editSubtitleLoading = true;
                    await saveSubtitleFunction();
                    editSubtitle = false;
                    editSubtitleLoading = false;
                }}
            />
            <IconButton someFunction={cancelSubtitle} icon={"close"} />
        </div>
    {:else}
        <div class="editLoading">
            <MagicalDotsSmall />
        </div>
    {/if}
</div>
{#if editSubtitle}
    <div class="field">
        <span class="char">{newSubtitle.length} / {maxLength} characters</span>
    </div>
{/if}

<style>
    .Subtitle {
        display: flex;
        align-items: center;
        gap: 10px;
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
    .textArea {
        width: 100%;
        font-size: medium;
        resize: none;
        overflow-y: hidden;
        white-space: pre-wrap;
        padding: 6px;
    }
    @media (max-width: 700px) {
        .textArea {
            min-height: 2em;
            line-height: 1;
        }
    }
</style>
