<script>
    import { goto } from "$app/navigation";
    import { authSubscribe, getDoc, initJuno } from "@junobuild/core-peer";
    import { onMount } from "svelte";

    export let reputation = 50;
    export let reputationInformation = "Based on past approved pledges.";
    let userKey = "";
    onMount(async () => {
        authSubscribe((user) => {
            if (user == null) {
                console.log("is null");
                goto("/signin/");
            } else {
                userKey = user.key;
            }
        });
    });
</script>

<div class="ReputationSection">
    <h3 style="margin: 0%;">Reputation</h3>
    {#await getDoc({ collection: "reputation", key: "REP_" + userKey })}
        <p>Loading...</p>
    {:then data}
        <p class="Reputation">
            {data?.description}%
            <span class="material-symbols-outlined"> local_florist </span>
        </p>
    {:catch error}
        <p>Error: {error.message}</p>
    {/await}

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
