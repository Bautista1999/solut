<script>
    import { createEventDispatcher } from "svelte";

    /**
     * @type {File[]}
     */
    export let files = []; // Export files for the parent to access
    export let maxFileSize = 2 * 1024 * 1024; // Default size is 2MB, configurable by the parent
    export let validExtensions = ["image/png", "image/jpeg"]; // Default file types, configurable by the parent
    export let handleUpload = async (/** @type {File} */ file) => {}; // Upload function passed from the parent; expects a File object
    let isDragging = false;

    const dispatch = createEventDispatcher();

    /**
     * Handles the drop event for files.
     * @param {DragEvent} event
     */
    function handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        isDragging = false;
        const droppedFiles = event.dataTransfer
            ? Array.from(event.dataTransfer.files)
            : [];
        console.log("Files length: ", droppedFiles.length);
        if (droppedFiles.length > 1) {
            alert("You cant upload more than one file.");
            return;
        }
        processFiles(droppedFiles);
    }

    /**
     * Handles file selection via input change.
     * @param {Event} event
     */
    function handleInputChange(event) {
        const target = /** @type {HTMLInputElement} */ (event.target);
        if (!target || !target.files) return;
        const selectedFiles = Array.from(target.files);
        processFiles(selectedFiles);
    }

    /**
     * Processes and validates files.
     * @param {File[]} fileList
     */
    function processFiles(fileList) {
        if (fileList.length > 1) {
            alert("You cant upload more than one file.");
            return;
        }
        fileList.forEach((file) => {
            if (!(file instanceof File)) return; // Ensure we are handling actual File objects

            if (!validExtensions.includes(file.type)) {
                alert("Only PNG and JPEG images are allowed.");
                return;
            }
            if (file.size > maxFileSize) {
                alert(
                    "File size exceeds the limit of " +
                        maxFileSize / 1024 / 1024 +
                        " MB",
                );
                return;
            }

            files = [...files, file];
            handleUpload(file); // Pass the file to the parent-provided upload handler
        });
    }

    /**
     * Handles drag over event to show drop effect.
     * @param {DragEvent} event
     */
    function handleDragOver(event) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "copy";
        }
        isDragging = true;
    }

    function handleDragLeave() {
        isDragging = false;
    }
</script>

<div
    class="uploadArea {isDragging ? 'dragging' : ''}"
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
>
    <p>
        {isDragging
            ? "Drop it here to upload files!"
            : "Drag & Drop a file here, or click to select a file"}
    </p>
    <input
        type="file"
        class="fileInput"
        multiple
        on:change={handleInputChange}
    />
</div>

<style>
    .uploadArea {
        border: 2px dashed var(--primary-color);
        padding: 20px;
        text-align: center;
        cursor: pointer;
        color: var(--primary-color);
        position: relative;
        transition: background-color 0.3s ease;
        width: 100%;
        max-width: 100%; /* Prevent overflow in constrained parent containers */
        box-sizing: border-box; /* Ensure padding and border fit within the set width */
    }

    .dragging {
        background-color: #f0f8ff;
        color: var(--primary-color);
        border: 2px dashed var(--primary-color);
    }

    .fileInput {
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }

    .uploadArea *::before,
    .uploadArea *::after {
        box-sizing: border-box;
    }
</style>
