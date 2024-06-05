<script>
    /**
     * @type {any[]}
     */
    export let milestones = [
        // {
        //     id: 1,
        //     title: "Project Kick-off",
        //     date: 1716595200000,
        //     icon: "rocket.svg",
        // },
        // {
        //     id: 2,
        //     title: "Launch Date",
        //     date: 1716595200000,
        //     icon: "rocket.svg",
        // },
        // {
        //     id: 3,
        //     title: "Testing phase",
        //     date: 1716595200000,
        //     icon: "rocket.svg",
        // },
        // {
        //     id: 4,
        //     title: "Alpha launch",
        //     date: 1716595200000,
        //     icon: "rocket.svg",
        // },
        // { id: 5, title: "Beta", date: 1716595200000, icon: "rocket.svg" },
        // Add more milestones if needed
    ];

    /**
     * @type {any[]}
     */
    export let updates = [
        // {
        //     id: 1,
        //     content: "Hey there! Today we have the project launch. Ready?",
        //     date: 1716595200000,
        //     milestoneId: 1,
        //     type: "development",
        // },
        // {
        //     id: 2,
        //     content:
        //         "After various months of development, today we have our testing launch phase. This is going to be huge! Hope you like it.",
        //     date: 1716595200000,
        //     milestoneId: 2,
        //     type: "design",
        // },
        // {
        //     id: 3,
        //     content:
        //         "After receiving some feedback, certain bugs were fixed. Already deployed the new version...",
        //     date: 1716595200000,
        //     milestoneId: 2,
        //     type: "development",
        // },
        // {
        //     id: 4,
        //     content:
        //         "Preparing for the alpha launch. Starting with the testing phase, crutial to ensure maximum user experience.",
        //     date: 1716595200000,
        //     milestoneId: 3,
        //     type: "development",
        // },
        // Add more updates if needed
    ];
    // Function to determine the update type color
    /**
     * @param {string} type
     */
    function getUpdateTypeColor(type) {
        switch (type) {
            case "development":
                return "#4caf50"; // green
            case "design":
                return "#2196f3"; // blue
            // Add more types and colors
            default:
                return "#9e9e9e"; // grey
        }
    }
</script>

<div class="timeline">
    {#if milestones.length > 0 && updates.length > 0}
        <div class="timeline-line"></div>
        {#each milestones as milestone (milestone.id)}
            <div class="timeline-item">
                <div class="milestone">
                    <div class="milestone-badge">{milestone.title}</div>
                    <div class="milestone-date">
                        {new Date(milestone.date).toISOString().split("T")[0]}
                    </div>
                </div>
                <div class="updates">
                    {#each updates.filter((u) => u.milestoneId === milestone.id) as update (update.id)}
                        <div
                            class="display:flex; justify-content:center; align-items:center; gap:0px; flex-direction:row;"
                        >
                            <div
                                style="width: 30px; height:1px; background-color:var(--seventh-color); transform: translateY(15px)  translateX(-10px);"
                            ></div>
                            <div class="update" style={``}>
                                <p>
                                    {update.content}
                                    <span
                                        style="font-size:small; font-weight:300; font-style:italic; "
                                    ></span>
                                </p>
                                <div class="update-date">
                                    {new Date(update.date)
                                        .toISOString()
                                        .split("T")[0]}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    {:else if milestones.length == 0 && updates.length > 0}
        <div class="timeline-line"></div>
        <div class="timeline-item">
            <div class="milestone"></div>
            <div class="updates">
                {#each updates as update (update.id)}
                    <div
                        class="display:flex; justify-content:center; align-items:center; gap:0px; flex-direction:row;"
                    >
                        <div
                            style="width: 30px; height:1px; background-color:var(--seventh-color); transform: translateY(15px)  translateX(-10px);"
                        ></div>
                        <div class="update" style={``}>
                            <p>
                                {update.content}
                                <span
                                    style="font-size:small; font-weight:300; font-style:italic; "
                                ></span>
                            </p>
                            <div class="update-date">
                                {new Date(update.date)
                                    .toISOString()
                                    .split("T")[0]}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {:else if milestones.length > 0 && updates.length == 0}
        {#each milestones as milestone (milestone.id)}
            <div
                class="timeline-item"
                style="display:flex;flex-direction:column;align-items: center; justify-content:center;"
            >
                <div class="timeline-line" style="left: 40%;;"></div>

                <div class="milestone" style="gap:30px;">
                    <div class="milestone-badge">{milestone.title}</div>
                    <div class="milestone-date" style="z-index:1; right: 110%;">
                        {new Date(milestone.date).toISOString().split("T")[0]}
                    </div>
                </div>
            </div>
        {/each}
    {:else if milestones.length == 0 && updates.length == 0}
        <p>No updates nor milestones to show</p>
    {/if}
</div>

<style>
    .timeline {
        position: relative;
        max-width: 800px; /* Set to the max-width you desire */
        margin: auto;
    }

    .timeline-line {
        position: absolute;
        left: 50%; /* Adjust if your milestones badges are different sizes */
        top: 0;
        bottom: 0;
        width: 1px;
        margin-bottom: 10px;
        background-color: var(--seventh-color);
    }

    .timeline-item {
        display: flex;
        align-items: flex-start; /* Align items to the top */
        margin-bottom: 20px;
    }

    .milestone,
    .updates {
        flex: 1;
    }

    .milestone {
        text-align: right;
        position: relative;
        padding-right: 20px;
    }

    .milestone-badge {
        background-color: var(--sky-blue);
        color: var(--seventh-color);
        padding: 5px 20px;
        border-radius: 2px; /* Less rounded than 50% */
        display: inline-block;
        min-width: fit-content;
        border: 1px solid var(--seventh-color);
        box-shadow: 2px 2px 0px 0px var(--seventh-color);
        margin-right: 20px; /* Distance from the line */
        position: relative;
        z-index: 2;
    }

    .milestone-date {
        font-size: 0.8em;
        color: #555;
        position: absolute;
        top: 50%;
        right: 88%;
        white-space: nowrap;
        transform: translateY(-50%);
    }

    .update {
        background-color: #f9f9f9;
        box-shadow: 2px 2px 0px 0px var(--seventh-color);
        margin-left: 20px;
        padding: 10px;
        border-left: 3px solid #6a0dad;
        position: relative;
        z-index: 1;
        margin-bottom: 10px;
        border: 1px solid var(--seventh-color);
        cursor: pointer;
    }

    .update p {
        margin: 0;
    }

    .update-date {
        font-size: 0.8em;
        color: #666;
        text-align: right;
    }
    .milestone-icon {
        width: 30px; /* Adjust as needed */
        margin-bottom: 10px;
    }
    .update {
        /* ... existing styles ... */
        transition:
            box-shadow 0.3s,
            transform 0.3s;
    }
    .update:hover {
        background-color: var(--fifth-color);
    }
</style>
