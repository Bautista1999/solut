<script>
    import { images, subtitle } from "$lib/data_objects/testing_objects";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import CircledButtonDarkSmall from "./CircledButtonDarkSmall.svelte";

    /**
     * @type {import("$lib/data_objects/data_types").feature[]}
     */
    export let ideas = [
        {
            title: "Some title",
            subtitle:
                "Subtitle some long subtitle that needs to cover at least some space",
            images: [
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS--zyCuSVjyCpJj27c3tZhSUJW3ZQeSUF90Q&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWd3t9xapdmxZPRDQ9y0emDyGrtKDoj5u-Aw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScdDJERRPGgu_4oGpJM11OrIO37kCcStcrUg&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS--zyCuSVjyCpJj27c3tZhSUJW3ZQeSUF90Q&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWd3t9xapdmxZPRDQ9y0emDyGrtKDoj5u-Aw&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScdDJERRPGgu_4oGpJM11OrIO37kCcStcrUg&s",
            ],
            description: "",
            videos: [],
            categories: [],
        },
        {
            title: "Wolverine videogame",
            subtitle:
                "Subtitle some long subtitle that needs to cover at least some space",
            images: [
                "https://i.ytimg.com/vi/Jfydm49qVTQ/maxresdefault.jpg",
                "https://i.ytimg.com/vi/Tjhh-k6rmi0/maxresdefault.jpg",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIL9mT5f8fKQsvUl9a1JptGCFpzFVvik1GP6rrSl2d5AqxgF6rAIhyJD1C9c8Ws0uktVs&usqp=CAU",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb_FiDCuw_phv7QoAAAO3P-Tem7QzNzTRBS917aL0aUqiFWB2IOzLVJS1XRB7766X2cU8&usqp=CAU",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8b2N5JwlRX4ySDR_YTR6eRkvh50FWu-3yfw&s",
            ],
            description: "",
            videos: [],
            categories: [],
        },
    ];
    let newIdeaTitle = "";
    let newIdeaSubtitle = "";
    /**
     * @type {any[]}
     */
    let newIdeaImageUrls = [];
    let url = "";

    function addIdea() {
        if (newIdeaTitle && newIdeaSubtitle) {
            ideas.push({
                title: newIdeaTitle,
                subtitle: newIdeaSubtitle,
                images: newIdeaImageUrls,
                description: "",
                videos: [],
                categories: [],
            });
            ideas = ideas;
            newIdeaTitle = "";
            newIdeaSubtitle = "";
            newIdeaImageUrls = [];
        }
    }

    /**
     * @param {string} urls
     */
    function addImage(urls) {
        if (urls) {
            newIdeaImageUrls.unshift(urls);
            newIdeaImageUrls = newIdeaImageUrls;
        }
        url = "";
    }

    /**
     * @param {number} index
     */
    function removeImage(index) {
        newIdeaImageUrls = newIdeaImageUrls.filter((_, i) => i !== index);
        newIdeaImageUrls = newIdeaImageUrls;
    }

    /**
     * @type {number | null}
     */
    let editingIndex = null; // Tracks the index of the currently edited idea

    let editTitle = "";
    let editSubtitle = "";
    /**
     * @type {any[]}
     */
    let editIdeaImages = [];
    let editImageUrl = "";

    /**
     * Start editing an idea by setting the editing index
     * @param {number} index - Index of the idea to edit
     */
    function startEditing(index) {
        editingIndex = index;
        editTitle = ideas[index].title;
        editSubtitle = ideas[index].subtitle;
        editIdeaImages = [...ideas[index].images];
    }

    /**
     * Save changes to an idea
     * @param {number} index - Index of the idea to update
     */
    function saveEdits(index) {
        if (editTitle.length == 0 || editSubtitle.length == 0) {
            return;
        }
        ideas[index] = {
            ...ideas[index],
            title: editTitle,
            subtitle: editSubtitle,
            images: editIdeaImages,
        };
        editImageUrl = "";

        stopEditing();
    }

    /**
     * Stop editing and reset input fields
     */
    function stopEditing() {
        editingIndex = null;
        editTitle = "";
        editSubtitle = "";
        editIdeaImages = [];
    }

    /**
     * @param {string} urls
     */
    function addEditImage(urls) {
        if (urls) {
            editIdeaImages.unshift(urls);
            editIdeaImages = editIdeaImages;
        }
        editImageUrl = "";
    }

    /**
     * @param {number} index
     */
    function removeEditImage(index) {
        editIdeaImages = editIdeaImages.filter((_, i) => i !== index);
        editIdeaImages = editIdeaImages;
    }

    /**
     * @param {number} index
     */
    function removeIdea(index) {
        ideas = ideas.filter((_, i) => i !== index);
        ideas = ideas;
    }

    const charLimit = { title: 70, subtitle: 200, description: 2000 };
</script>

<div class=" form-section forms-box">
    <div class="form-section">
        <label for="title">Title</label>
        <input
            type="text"
            bind:value={newIdeaTitle}
            class="InputText"
            placeholder="Title of the Idea"
        />
        <div class="field-info">
            {#if newIdeaTitle.length === 0}
                <span class="required-field">*Required field</span>
            {:else}
                <span></span>
            {/if}
            <span class="char-count"
                >{newIdeaTitle.length} / {charLimit.title} characters</span
            >
        </div>
    </div>

    <div class="form-section">
        <label for="title">Subtitle</label>
        <input
            type="text"
            class="InputText"
            bind:value={newIdeaSubtitle}
            placeholder="Subtitle"
        />
        <div class="field-info">
            {#if newIdeaSubtitle.length === 0}
                <span class="required-field">*Required field</span>
            {:else}
                <span></span>
            {/if}
            <span class="char-count"
                >{newIdeaSubtitle.length} / {charLimit.subtitle} characters</span
            >
        </div>
    </div>
    <div class="form-section">
        <label for="images"
            >Images <span class="optionalText">(Optional field)</span></label
        >
        <div class="HorizontallyAligned">
            <input
                type="text"
                placeholder="Image URL"
                class="InputText"
                bind:value={url}
            />
            <BasicButtonDarkSmall
                msg="Add image"
                someFunction={() => {
                    addImage(url);
                }}
            />
        </div>
        <br />
        {#if newIdeaImageUrls.length > 0}
            <div class="image-container">
                {#each newIdeaImageUrls as url}
                    <div>
                        <div
                            class="image"
                            style="background-image: url({url})"
                        ></div>
                        <div class="delete-button">
                            <CircledButtonDarkSmall
                                icon={"delete"}
                                someFunction={() =>
                                    removeImage(newIdeaImageUrls.indexOf(url))}
                            />
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
        <BasicButtonDarkSmall msg="Save" someFunction={addIdea} />
    </div>
</div>

<br />
<div class="form-section">
    <label for="ideas">Your ideas</label>
    {#if ideas.length > 0}
        <div class="SmallSeparator" style="height: fit-content;">
            {#each ideas as idea, index}
                <div class="IdeasDisplay" style="flex-direction: column;">
                    {#if editingIndex === index}
                        <div class="form-section">
                            <label for="editTitle">Title </label>
                            <input bind:value={editTitle} class="InputText" />
                            <div class="field-info">
                                {#if editTitle.length === 0}
                                    <span class="required-field"
                                        >*Required field</span
                                    >
                                {:else}
                                    <span></span>
                                {/if}
                                <span class="char-count"
                                    >{editTitle.length} / {charLimit.title}
                                    characters</span
                                >
                            </div>
                        </div>

                        <div class="form-section">
                            <label for="editSubtitle">Subtitle </label>
                            <input
                                bind:value={editSubtitle}
                                class="InputText"
                            />
                            <div class="field-info">
                                {#if editSubtitle.length === 0}
                                    <span class="required-field"
                                        >*Required field</span
                                    >
                                {:else}
                                    <span></span>
                                {/if}
                                <span class="char-count"
                                    >{editSubtitle.length} / {charLimit.subtitle}
                                    characters</span
                                >
                            </div>
                        </div>

                        <div class="form-section">
                            <label for="editIdeaImages"
                                >Images <span class="optionalText">
                                    (Optional field)</span
                                >
                            </label>
                            {#if editIdeaImages.length > 0}
                                <div class="image-container">
                                    {#each editIdeaImages as img, i}
                                        <div>
                                            <div
                                                class="image"
                                                style="background-image: url({img})"
                                            ></div>
                                            <div class="delete-button">
                                                <CircledButtonDarkSmall
                                                    icon={"delete"}
                                                    someFunction={() =>
                                                        removeEditImage(i)}
                                                />
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <p style="margin-bottom: 5px;">
                                    ---- You havent included any image. Include
                                    some images in the text field. ----
                                </p>
                            {/if}
                            <div class="HorizontallyAligned">
                                <input
                                    type="text"
                                    class="InputTextSmall"
                                    bind:value={editImageUrl}
                                />
                                <BasicButtonDarkSmall
                                    msg={"Add image"}
                                    someFunction={() => {
                                        addEditImage(editImageUrl);
                                    }}
                                />
                            </div>
                        </div>
                        <div class="VerticallyAligned HorizontallyAligned">
                            <BasicButtonDarkSmall
                                msg={"Save"}
                                someFunction={() => {
                                    saveEdits(index);
                                }}
                            />
                            <BasicButtonDarkSmall
                                msg={"Cancel"}
                                someFunction={() => {
                                    stopEditing();
                                }}
                            />
                        </div>
                    {:else}
                        <div
                            style="display: flex; flex-direction:column; gap:10px;"
                        >
                            <h3 style="margin: 0px;">{idea.title}</h3>
                            <p>{idea.subtitle}</p>
                            {#if idea.images.length > 0}
                                <div class="image-container">
                                    {#each idea.images as img}
                                        <div
                                            class="image"
                                            style="background-image: url({img})"
                                        ></div>
                                    {/each}
                                </div>
                                <div
                                    style="transform: translateX(505%);height:fit-content; position:absolute; z-index:100;"
                                >
                                    <div
                                        class="VerticallyAligned HorizontallyAligned"
                                    >
                                        <BasicButtonDarkSmall
                                            msg="edit"
                                            someFunction={() =>
                                                startEditing(index)}
                                        />
                                        <CircledButtonDarkSmall
                                            icon="delete"
                                            someFunction={() =>
                                                removeIdea(index)}
                                        />
                                    </div>
                                </div>
                            {:else}
                                <div
                                    style="transform: translateX(505%);height:fit-content; position:absolute; z-index:100;"
                                >
                                    <div
                                        class="VerticallyAligned HorizontallyAligned"
                                    >
                                        <BasicButtonDarkSmall
                                            msg="edit"
                                            someFunction={() =>
                                                startEditing(index)}
                                        />
                                        <CircledButtonDarkSmall
                                            icon="delete"
                                            someFunction={() =>
                                                removeIdea(index)}
                                        />
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {:else}
        <div class="VerticallyAligned">
            <p style="font-size: small; font-style:italic;">
                --------------- No idea was added yet. ---------------
            </p>
        </div>
    {/if}
</div>

<style>
    @import "../../routes/createtopic/createtopic.styles.css";
    .forms-box {
        border: 1px solid var(--seventh-color);
        background-color: var(--forth-color);
        padding: 20px;
    }

    .IdeasDisplay {
        border: 1px solid var(--seventh-color);
        padding: 10px;
    }
    .delete-button {
        position: relative;
        cursor: pointer;
        width: fit-content;
        top: 5px;
        right: 5px;
        transform: translateY(-270%) translateX(410%);
    }
    .image-container {
        display: flex;
        overflow-x: auto;
        height: 110px;
        gap: 10px;
        padding-bottom: 10px; /* Adjust this value to increase or decrease the space */
    }
    /* Styles for WebKit browsers like Chrome, Safari */
    .image-container::-webkit-scrollbar {
        height: 5px; /* Height of the horizontal scrollbar */
        padding: 3px;
        border: 1px solid var(--seventh-color);
    }

    .image-container::-webkit-scrollbar-track {
        background: lightgray; /* Color of the track */
        margin-top: 3px;
    }

    .image-container::-webkit-scrollbar-thumb {
        background-color: var(
            --primary-color
        ); /* Color of the scrollbar itself */
    }
    .image {
        height: 100px; /* Adjust height to fit your design */
        flex: 0 0 auto;
        background-size: cover;
        background-position: center;
        z-index: 1;
        aspect-ratio: 1200 / 628;
    }
</style>
