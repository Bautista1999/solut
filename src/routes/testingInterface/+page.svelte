<script>
    import {
        getDocDatabase,
        setDocJunoBridge,
        testDatabase,
        getDocJunoBridge,
        getManyDocs,
        setManyDocs,
        listJunoDocs,
        updateJunoDocument,
        deleteJunoDoc,
        deleteManyJunoDocs,
        setPledgesSolutionDoc,
        CreateUser,
        CreateIdea,
        WhoAmI,
        CreateFeature,
        pledgeCreate,
        getUserBalance,
        ICPtoDecimal,
        pledgeEdit,
        createSolution,
        submitSolution,
        aprovedPledgeVerify,
        follow,
        unfollow,
        createNewJunoDocument,
        changeStatus,
        increaseUserRevenue,
    } from "$lib/testingInterface_logic/testing.interface.logic";
    import { initJuno, setDoc } from "@junobuild/core";
    import { onMount } from "svelte";
    import { nanoid } from "nanoid";
    import LoadingBadge from "$lib/components/loadingBadge.svelte";
    import Success from "$lib/components/success.svelte";
    import Loading from "$lib/components/loading.svelte";

    $: docKey = "";
    $: userBalance = BigInt(0);
    let id1 = "";
    let id2 = "";
    let waiting = false;
    let success = false;
    let documentCreatedJunoDb = false;
    let documentCreatedAdminDb = false;
    let loadingMsg = "Creating pledge...";
    let successMsg = "Pledge created successfully!";
    onMount(async () => {
        setTimeout(async () => {
            userBalance = await getUserBalance();
        }, 5000);
    });
    async function setRandomDoc() {
        id1 = nanoid();
        console.log("Setting doc...");
        await testDatabase(id1);
        console.log("Done!");
        documentCreatedJunoDb = true;
    }
    async function getRandomDoc() {
        console.log("Getting doc...");
        // @ts-ignore
        let doc = await getDocDatabase(id1);
        // @ts-ignore
        docKey = doc?.key;
        console.log("Done!");
        console.log(docKey);
    }
    async function setJunoDoc() {
        id2 = nanoid();
        console.log("Setting doc...");
        await setDocJunoBridge(id2);
        console.log("Done!");
        documentCreatedAdminDb = true;
    }
    async function getJunoDoc() {
        console.log("Getting doc...");
        let doc = await getDocJunoBridge(id2);
        // @ts-ignore
        docKey = doc?.key;
        console.log("Done!");
        console.log(docKey);
    }
</script>

{#if !success}
    {#if !waiting}
        <div
            style="margin: auto;
        align-self: flex-start; /* This will align it to the top with the title */
        
        border-color:black;
        border-width:2px;
        background-color:white;
        padding: 10px;
        margin-top:20px;
        width: 50%;


"
        >
            <!-- <h3
                style="color: black;
    font-size:30px;
    font-weight:500;
    "
            >
                Testing new juno database
            </h3>
            <br />
            <button
                style="background:green;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    await setRandomDoc();
                }}>Set random Doc</button
            >
            <br />
            <br />
            {#if documentCreatedJunoDb}
                <button
                    style="background:blue;
            padding: 4px;
            border-color:black;
            border-width:1px;"
                    on:click={async () => {
                        getRandomDoc();
                    }}>Get that Doc</button
                >
                <p style="color: black;">
                    Get the Doc's key (press the button): {docKey}
                </p>
            {/if}
            <br />
        </div>
        <div
            style="margin: auto;
        align-self: flex-start; /* This will align it to the top with the title */
        
        border-color:black;
        border-width:2px;
        background-color:white;
        padding: 10px;
        margin-top:20px;
        width: 50%;


"
        >
            <h3
                style="color: black;
    font-size:30px;
    font-weight:500;
    "
            >
                Testing new juno database through the admin
            </h3>
            <br />
            <button
                style="background:green;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    setJunoDoc();
                }}>Set Juno Doc</button
            >
            <br />
            <br />
            {#if documentCreatedAdminDb}
                <button
                    style="background:blue;
            padding: 4px;
            border-color:black;
            border-width:1px;"
                    on:click={async () => {
                        getJunoDoc();
                    }}>Get that Doc</button
                >
                <p style="color: black;">
                    Get the Doc's key (press the button): {docKey}
                </p>
            {/if}
            <button
                style="background:green;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    getManyDocs();
                }}>Get Many Docs</button
            >
            <button
                style="background:purple;
    padding: 4px;
    border-color:black;
    border-width:1px;"
                on:click={async () => {
                    await CreateUser();
                }}>Create User</button
            >
            <button
                style="background:orangered;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    setManyDocs();
                }}>Set Many Docs</button
            >
            <button
                style="background:orangered;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    listJunoDocs();
                }}>List Filtered Docs</button
            >
            <br />
            <br />
            <button
                style="background:orangered;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    updateJunoDocument();
                }}>Update Juno Doc</button
            >
            <button
                style="background:purple;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    deleteJunoDoc();
                }}>Delete Juno Doc</button
            >
            <button
                style="background:purple;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    deleteManyJunoDocs();
                }}>Delete Many Juno Docs</button
            >
            <button
                style="background:purple;
    padding: 4px;
    border-color:black;
    border-width:1px;"
                on:click={async () => {
                    await CreateIdea();
                }}>Create idea</button
            >
            <button
                style="background:yellow;
    padding: 4px;
    border-color:black;
    border-width:1px;
    color: black"
                on:click={async () => {
                    await CreateFeature();
                }}>Create feature</button
            >
            <button
                style="background:skyblue;
    padding: 4px;
    border-color:black;
    border-width:1px;"
                on:click={async () => {
                    await WhoAmI();
                }}>Who am i?</button
            >
        </div>
        <div
            style="margin: auto;
        align-self: flex-start; /* This will align it to the top with the title */
        
        border-color:black;
        border-width:2px;
        background-color:white;
        padding: 10px;
        margin-top:20px;
        width: 50%;


"
        > -->
            <h3
                style="color: black;
    font-size:30px;
    font-weight:500;
    "
            >
                Testing admin functions
            </h3>
            <br />
            <p style="color: black;">
                Your balance: {ICPtoDecimal(userBalance)} ICP tokens
            </p>
            <br />
            <p style="color: black;">
                What you are pledging: {ICPtoDecimal(BigInt(1.2 * 1e8))} ICP tokens
            </p>
            <br />

            <button
                style="background:purple;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    await pledgeCreate();
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Pledge Create</button
            >
            <button
                style="background:purple;
    padding: 4px;
    border-color:black;
    border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    await pledgeEdit();
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Pledge Edit</button
            >
            <br />
            <br />
            <button
                style="background:green;
    padding: 4px;
    border-color:black;
    border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    await createSolution();
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Create solution!</button
            >
            <button
                style="background:green;
    padding: 4px;
    border-color:black;
    border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Submiting solution...";
                    await submitSolution();
                    successMsg =
                        "Success: Solution status changes to 'delivered'";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Submit solution!</button
            >
            <button
                style="background:green;
    padding: 4px;
    border-color:black;
    border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Changing solution status...";
                    await changeStatus();
                    successMsg =
                        "Success: Solution status changed to 'completed'";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Update solution status!</button
            >
            <button
                style="background:green;
padding: 4px;
border-color:black;
border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Approving solution...";
                    await aprovedPledgeVerify();
                    successMsg = "Success: Solution verified";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Approve Solution!</button
            >
            <br />
            <button
                style="background:green;
padding: 4px;
border-color:black;
border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Following fairtale...";
                    await follow();
                    successMsg = "Success: Fairtale follow";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Follow fairtale!</button
            >
            <button
                style="background:green;
padding: 4px;
border-color:black;
border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Unfollowing fairtale...";
                    await unfollow();
                    successMsg = "Success: Fairtale unfollow";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Unfollow fairtale!</button
            >
            <button
                style="background:green;
padding: 4px;
border-color:black;
border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Creating idea...";
                    await CreateIdea();
                    successMsg = "Success: Idea created";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Create idea increasing Ideas!</button
            >
            <button
                style="background:orangered;
padding: 4px;
border-color:black;
border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Increasing user's revenue...";
                    await increaseUserRevenue();
                    successMsg = "Success: Revenue increased";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Increase revenue!</button
            >
        </div>
    {:else}
        <!-- <Loading marginTop={1} width={20} msg={"Creating pledge..."} /> -->
        <div
            style="display: flex; margin-top: 20px; justify-content:  center; align-items: center; flex-direction: column;"
        >
            <img
                src="https://i.gifer.com/Bciu.gif"
                alt="Loading animation"
                width="200"
                height="200"
            />
            <p style="font-style: italic;">{loadingMsg}.</p>
        </div>
    {/if}
{:else}
    <Success msg={successMsg} />
{/if}

<style>
</style>
