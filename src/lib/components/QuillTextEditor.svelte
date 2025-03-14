<script>
    import Quill from "quill";
    import { onMount } from "svelte";

    export let maxCharacters = 3000;
    export let description = "";

    /**
     * @type {Quill}
     */
    let editor;
    let currentTextLength = 0;
    let showError = false;
    export let updateProgress = () => {};

    onMount(() => {
        const editorContainer = document.getElementById("editor-container");
        // @ts-ignore
        editor = new Quill(editorContainer, {
            theme: "snow",
            modules: {
                toolbar: [
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                ],
            },
        });

        if (description) {
            editor.root.innerHTML = description;
            currentTextLength = editor.getText().trim().length;
        }

        editor.on("text-change", () => {
            const plainTextContent = editor.getText().trim();
            if (plainTextContent != "") {
                const htmlContent = editor.root.innerHTML;

                currentTextLength = plainTextContent.length;
                showError = htmlContent.length > maxCharacters;
                description = htmlContent;
                updateProgress();
                return;
            } else {
                description = "";
                updateProgress();
                return;
            }
        });
    });
</script>

<div class="editor-holder">
    <div id="editor-container" style="height: 200px;  "></div>
</div>
{#if showError}
    <div class="error-message">
        You have exceeded the {maxCharacters} character limit. Please shorten your
        text.
    </div>
{/if}

<style>
    @import "quill/dist/quill.snow.css"; /* Import Quill's default theme */

    .editor-holder {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    /* Error message styling */
    .error-message {
        color: var(--danger-color, red);
        font-size: 0.9em;
        margin-top: 5px;
    }

    /* Style the content area */
    :global(.ql-editor) {
        padding: 10px;
        min-height: 180px;
        border: 1px solid var(--seventh-color);
        background-color: white;
        border-radius: 8px;
    }
    :global(.ql-editor:focus) {
        border: 2px solid var(--primary-color);
    }

    /* Style for the toolbar */
    :global(.ql-toolbar) {
    }
    :global(.ql-container.ql-snow) {
        border: none;
    }

    /* Default and hover icon color */
    :global(.ql-toolbar button .ql-stroke),
    :global(.ql-toolbar button .ql-fill) {
        /* stroke: var(--seventh-color); */
        fill: transparent;
    }
    :global(.ql-toolbar button:hover .ql-stroke),
    :global(.ql-toolbar button:hover .ql-fill) {
        stroke: var(--primary-color) !important;
        fill: transparent !important;
    }
    :global(.ql-toolbar button.ql-active .ql-stroke),
    :global(.ql-toolbar button.ql-active .ql-fill) {
        stroke: var(--primary-color) !important;
    }
</style>
