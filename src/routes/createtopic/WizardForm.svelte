<script>
    import BasicButtonDarkSmall from "$lib/components/BasicButton_Dark_Small.svelte";
    import BasicRoundedButton from "$lib/components/BasicRoundedButton.svelte";
    import BasicRoundedButtonSmall from "$lib/components/BasicRoundedButtonSmall.svelte";
    import ImageScroller from "$lib/components/imageScroller.svelte";
    import ImageScrollerEdit from "$lib/components/ImageScroller_Edit.svelte";
    import { createEventDispatcher } from "svelte";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import ProgressIndicator from "./ProgressIndicator.svelte";
    import BasicButtonDark from "$lib/components/basicButton_Dark.svelte";
    /**
     * @type {ImageScrollerEdit}
     */
    let imageScroller;
    /**
     * @type {string[]}
     */
    export let images = [];
    export let title = "";
    export let subtitle = "";
    export let description = "";
    /**
     * @type {string[]}
     */
    export let tags = [];
    export let type = "Topic";
    const charLimit = { title: 70, subtitle: 200, description: 2000 };
    let newImage = "";
    function addImage() {
        imageScroller.addNewImage(newImage);
        if (newImage == "") {
            return;
        }
        images = [...images, newImage]; // Use spread syntax to trigger reactivity
        newImage = "";
    }

    /**
     * @type {any[]}
     */
    let additionalFields = [];
    let totalFields = 3; // Title, Subtitle, Description

    let progress = 0;

    const dispatch = createEventDispatcher();

    function updateProgress() {
        const baseFieldsCompleted =
            Number(title.length > 0) +
            Number(subtitle.length > 0) +
            Number(description.length > 0);

        const additionalFieldsCompleted = additionalFields.filter(
            (f) => f.completed,
        ).length;

        const completedFields = baseFieldsCompleted + additionalFieldsCompleted;
        progress = Math.round((completedFields / totalFields) * 100);
    }

    // Register new fields to be part of progress calculation
    /**
     * @param {string} name
     */
    function registerField(name) {
        additionalFields = [...additionalFields, { name, completed: false }];
        totalFields++;
    }
    export let PostElement = async () => {};
    // Update a field's completion status
    /**
     * @param {any} name
     * @param {any} completed
     */
    export function updateFieldStatus(name, completed) {
        const field = additionalFields.find((f) => f.name === name);
        if (field) {
            field.completed = completed;
            updateProgress();
        }
    }

    function submitForm() {
        if (progress === 100) {
            const formData = {
                title: title,
                subtitle: subtitle,
                description: description,
            };
            dispatch("submit", formData);
            PostElement();
        } else {
            alert("Please complete all fields before submitting.");
        }
    }
    let newTag = "";

    let tagsTooLong = false;
    function addTag() {
        if (newTag == "") {
            newTag = "";
            return;
        }
        if (newTag == ",") {
            newTag = "";
            return;
        }
        if (newTag == ".") {
            newTag = "";
            return;
        }
        if (newTag.includes(",") || newTag.includes(".")) {
            newTag = "";
            return;
        }
        if (tags.includes(newTag)) {
            newTag = "";
            return;
        }
        if (tags.length >= 5) {
            tagsTooLong = true;
            setTimeout(() => {
                tagsTooLong = false;
            }, 4000);
            return;
        }
        tags = [...tags, newTag]; // Use spread syntax to trigger reactivity
        newTag = "";
    }
    /**
     * @param {string} tag
     */
    function deleteTag(tag) {
        let currentIndex = tags.indexOf(tag);
        tags.splice(currentIndex, 1);
        tags = [...tags];
    }
</script>

<div class="wizard-container">
    <h1>Create {type}</h1>
    <ProgressIndicator {progress} />

    <div class="form-section">
        <label for="title">Title</label>
        <input
            type="text"
            id="title"
            bind:value={title}
            placeholder="Enter your title..."
            maxlength={charLimit.title}
            on:input={updateProgress}
            class="InputText"
        />
        <div class="field-info">
            {#if title.length === 0}
                <span class="required-field">*Required field</span>
            {:else}
                <span></span>
            {/if}
            <span class="char-count"
                >{title.length} / {charLimit.title} characters</span
            >
        </div>
    </div>

    <div class="form-section">
        <label for="subtitle">Subtitle</label>
        <input
            type="text"
            id="subtitle"
            bind:value={subtitle}
            placeholder="Enter your subtitle..."
            maxlength={charLimit.subtitle}
            class="InputText"
            on:input={updateProgress}
        />
        <div class="field-info">
            {#if subtitle.length === 0}
                <span class="required-field">*Required field</span>
            {:else}
                <span></span>
            {/if}
            <span class="char-count"
                >{subtitle.length} / {charLimit.subtitle} characters</span
            >
        </div>
    </div>
    <div class="form-section">
        <label for="images"
            >Images <span class="optionalText">(Optional field)</span></label
        >
        <div style="background-color: var(--secondary-color);">
            <ImageScrollerEdit bind:this={imageScroller} />
        </div>
    </div>

    <div
        class="form-section"
        style="display:flex;flex-direction: row;justify-content:left;align-items:center;
        gap:20px;
        
        "
    >
        <input
            type="text"
            placeholder="Type the url of the image here..."
            class="InputTextSmall"
            bind:value={newImage}
        />
        <!-- <BasicRoundedButtonSmall
            msg={"Add image"}
            someFunction={addImage}
            disabledCondition={null}
        /> -->
        <BasicButtonDarkSmall msg="Add image" someFunction={addImage} />
    </div>
    <div class="form-section">
        <label for="description">Description</label>
        <textarea
            id="description"
            bind:value={description}
            placeholder="Enter your description..."
            maxlength={charLimit.description}
            on:input={updateProgress}
            class="InputText"
        ></textarea>
        <div class="field-info">
            {#if description.length === 0}
                <span class="required-field">*Required field</span>
            {:else}
                <span></span>
            {/if}
            <span class="char-count"
                >{description.length} / {charLimit.description} characters</span
            >
        </div>
    </div>
    <div class="form-section">
        <label for="tags"
            >Tags <span class="optionalText">(Optional field)</span></label
        >
        <div class="tagInput">
            <input
                type="text"
                maxlength="20"
                bind:value={newTag}
                on:keypress={(event) => {
                    if (event.key == "Enter") {
                        addTag();
                    }
                    if (event.key == ",") {
                        addTag();
                    }
                    if (event.key == ".") {
                        addTag();
                    }
                }}
                class="InputText"
            />
            <!-- <BasicRoundedButtonSmall
                msg={"Add tag"}
                someFunction={addTag}
                disabledCondition={newTag.length == 0}
            /> -->
            <BasicButtonDarkSmall msg="Add tag" someFunction={addTag} />
        </div>
        {#if tagsTooLong}
            <p class="InputErrorMessage">You can't have more than 5 tags.</p>
        {/if}
        <div class="tags">
            {#each tags as tag}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="tag">
                    <p>{tag}</p>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <span
                        class="material-symbols-outlined"
                        style="cursor: pointer;"
                        on:click={() => {
                            deleteTag(tag);
                        }}
                    >
                        delete
                    </span>
                </div>
            {/each}
        </div>
    </div>

    <slot name="additional-fields" />
    <div class="form-actions">
        <!-- <BasicRoundedButton
            msg={"Submit"}
            someFunction={submitForm}
            disabledCondition={description.length === 0 ||
                title.length === 0 ||
                subtitle.length === 0}
        /> -->
        <BasicButtonDark
            msg="Submit"
            someFunction={() => {
                if (
                    description.length === 0 ||
                    title.length === 0 ||
                    subtitle.length === 0
                ) {
                    return;
                }
                submitForm();
            }}
        />
    </div>
</div>

<style>
    @import "../../routes/createtopic/createtopic.styles.css";
</style>
