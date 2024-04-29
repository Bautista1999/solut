<script>
    export let reputation = 50;
    export let reputationInformation = "Based on past approved pledges.";
</script>

<div class="ReputationSection">
    <h3 style="margin: 0%;">Reputation</h3>
    <p class="Reputation">
        {reputation}%
        <span class="material-symbols-outlined"> local_florist </span>
    </p>
    <p style="margin:0px; font-size:small;">
        {reputationInformation}<span
            style="text-decoration: underline;cursor:pointer;"
        >
            Read more</span
        >
    </p>
</div>

<style>
    .ReputationSection {
        display: flex;

        justify-content: center;
        align-items: center;
        flex-direction: column;
        text-align: center;
        gap: 5px;
        margin: 0;
        padding: 10px;
    }
    .Reputation {
        font-size: xx-large;
    }
</style>
