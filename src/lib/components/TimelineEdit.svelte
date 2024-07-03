<script>
    // @ts-ignore
    import { title } from "$lib/data_objects/testing_objects";
    import { writable } from "svelte/store";
    import FlatButtonDarkSmall from "./FlatButtonDarkSmall.svelte";
    import FlatButtonSmall from "./FlatButtonSmall.svelte";
    import CircledButtonSmall from "./CircledButtonDarkSmall.svelte";

    export let milestones = [
        {
            id: 1,
            title: "Project Kick-off",
            date: new Date("2024-05-25").getTime(),
            description: "delete",
        },
        {
            id: 2,
            title: "Launch Date",
            date: new Date("2024-05-25").getTime(),
            description: "delete",
        },
        {
            id: 3,
            title: "Testing phase",
            date: new Date("2024-05-25").getTime(),
            description: "delete",
        },
        {
            id: 4,
            title: "Alpha launch",
            date: new Date("2024-05-25").getTime(),
            description: "delete",
        },
        {
            id: 5,
            title: "Beta",
            date: new Date("2024-05-25").getTime(),
            description: "delete",
        },
    ];

    let newMilestoneTitle = "";
    let newMilestoneDate = "";

    // Reactive statement to sort milestones by date
    $: milestones = milestones.sort((a, b) => a.date - b.date);

    function addMilestone() {
        if (newMilestoneTitle.trim() && newMilestoneDate) {
            const newMilestone = {
                id: milestones.length + 1,
                title: newMilestoneTitle,
                date: new Date(newMilestoneDate).getTime(),
                description: "",
            };
            milestones = [...milestones, newMilestone];
            newMilestoneTitle = "";
            newMilestoneDate = "";
        }
    }

    /**
     * @param {number} id
     */
    function deleteMilestone(id) {
        milestones = milestones.filter((m) => m.id !== id);
    }

    let editingId = writable(null);

    /**
     * @param {null|number} id
     */
    function startEditing(id) {
        // @ts-ignore
        editingId.set(id);
    }

    /**
     * @param {number} id
     * @param {string} newTitle
     * @param {number} newDate
     */
    function saveEdits(id, newTitle, newDate) {
        console.log("Date", newDate);

        const index = milestones.findIndex((m) => m.id === id);
        milestones[index].title = newTitle;
        console.log("Date", milestones[index].date);
        milestones[index].date = new Date(newDate).getTime();

        milestones = milestones.sort((a, b) => a.date - b.date);
        milestones = milestones;
        editingId.set(null); // Stop editing
    }

    function cancelEditing() {
        editingId.set(null);
    }
</script>

<div class="add-milestone-form">
    <input
        type="text"
        bind:value={newMilestoneTitle}
        placeholder="Milestone Title"
        class="InputText"
    />
    <input type="date" bind:value={newMilestoneDate} class="InputText" />
    <FlatButtonSmall msg={"Add"} someFunction={addMilestone} />
</div>

<div class="timeline">
    {#each milestones as milestone (milestone.id)}
        <div class="timeline-item">
            {#if $editingId === milestone.id}
                <div class="timeline-date" style="width: fit-content;">
                    <input bind:value={milestone.date} type="date" />
                </div>
                <div class="timeline-content">
                    <div class="milestone-title">
                        <input
                            type="text"
                            style="width:110px;font-family:'Barlow'; font-size:medium;"
                            bind:value={milestone.title}
                        />
                    </div>
                </div>
                <div style="padding-inline:15px;">
                    <FlatButtonDarkSmall
                        msg="Save"
                        someFunction={() =>
                            saveEdits(
                                milestone.id,
                                milestone.title,
                                milestone.date,
                            )}
                    />
                </div>
                <FlatButtonDarkSmall
                    msg="Cancel"
                    someFunction={cancelEditing}
                />
            {:else}
                <div class="timeline-date">
                    {new Date(milestone.date).toLocaleDateString()}
                </div>
                <div class="timeline-content">
                    <div class="milestone-title">{milestone.title}</div>
                </div>
                <div style="padding-inline:15px;">
                    <FlatButtonDarkSmall
                        msg={"edit"}
                        icon={"edit"}
                        someFunction={() => startEditing(milestone.id)}
                    />
                </div>
                {#if milestone.title != "Project Kick-off" && milestone.title != "Delivery Date"}
                    <CircledButtonSmall
                        icon={"delete"}
                        someFunction={() => deleteMilestone(milestone.id)}
                    />
                {/if}
            {/if}
        </div>
    {/each}
</div>

<style>
    .timeline {
        width: 100%; /* Full width */
        position: relative;
        padding-left: 20px; /* Space for the line */
        border-left: 2px solid #ccc; /* Vertical line */
    }

    .timeline-item {
        position: relative;
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        z-index: 2;
    }

    .timeline-date {
        width: 100px; /* Fixed width for alignment */
        font-weight: bold;
        border: 1px solid var(--sky-blue);
        text-align: center;
        padding: 5px;
        z-index: 2; /* Higher z-index to be above the line */
        background-color: var(--tertiary-color);
    }

    .timeline-content {
        flex-grow: 1;
        background-color: var(--sky-blue);
        max-width: fit-content;
        gap: 10px;
        margin-left: 20px; /* Space between date and content */
        padding: 10px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 2; /* Higher z-index to be above the line */
    }

    .milestone-title {
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 200,
            "GRAD" 0,
            "opsz" 24;
        cursor: pointer;
    }
    .material-symbols-outlined:hover {
        color: var(--tertiary-color);
    }

    /* Horizontal lines for each item */
    .timeline-item::before {
        content: "";
        position: absolute;
        top: 50%;
        left: -20px; /* Line starts from the vertical line */
        width: 150px; /* Extend to the full width of the timeline-content */
        border-top: 2px solid #ccc;
        z-index: 1;
    }
    .addbuttonLine::before {
        width: 50px; /* Extend to the full width of the timeline-content */
    }

    .add-milestone-form {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .add-milestone-form input[type="text"],
    .add-milestone-form input[type="date"] {
        flex-grow: 1;
        margin-right: 10px;
    }

    .add-milestone-form button {
        padding: 5px 10px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
    }

    .add-milestone-form button:hover {
        background-color: var(--dark-primary-color);
    }
    @media (max-width: 480px) {
        .InputText {
            width: 20px;
        }
    }
</style>
