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
        createNotification,
        deleteElement,
        rejectSolution,
        approveTransaction,
        removeApproval,
        getApprovals,
        completeSolution,
        getTransactions,
        getTransactions_byTarget,
        getReputation,
        getTransactions_bySender,
        getTransactions_byProject,
        getUser_Revenue,
    } from "$lib/testingInterface_logic/testing.interface.logic";
    import { initJuno, setDoc } from "@junobuild/core";
    import { onMount } from "svelte";
    import { nanoid } from "nanoid";
    import LoadingBadge from "$lib/components/loadingBadge.svelte";
    import Success from "$lib/components/success.svelte";
    import { idlFactory } from "/Users/juanbautistamartinezrezzio/Documents/Dev/ic_project/solutio/src/lib/declarations/escrow.declarations.did.js";
    import Loading from "$lib/components/loading.svelte";
    import { Principal } from "@dfinity/principal";
    import { IDL } from "@dfinity/candid";

    $: docKey = "";
    $: userBalance = BigInt(0);
    let reputation = {
        amount_promised: IDL.Nat,
        amount_paid: IDL.Nat,
        number: IDL.Nat,
    };
    let id1 = "";
    let id2 = "";
    let waiting = false;
    let success = false;
    let documentCreatedJunoDb = false;
    let documentCreatedAdminDb = false;
    let loadingMsg = "Creating pledge...";
    let successMsg = "Pledge created successfully!";
    let appr = {
        approval_transaction_number: IDL.Nat,
        sender: IDL.Principal,
        target: IDL.Principal,
        amount: IDL.Nat,
    };
    /**
     * @type {appr[]}
     */
    $: approvals = [];
    let trans = {
        status: IDL.Text,
        created_at: IDL.Nat64,
        sender: IDL.Principal,
        target: IDL.Principal,
        message: IDL.Text,
        project_id: IDL.Text,
        transaction_number: IDL.Opt(IDL.Nat),
        amount: IDL.Nat,
    };
    /**
     * @type {trans[]}
     */
    $: transactions = [];
    /**
     * @type {trans[]}
     */
    $: transactions_target = [];
    $: target = "";
    onMount(async () => {
        setTimeout(async () => {
            userBalance = await getUserBalance();
            reputation = await getReputation();
        }, 5000);
    });
    async function doCompleteSolution() {
        let isSolutionComplete = false;

        // Start the asynchronous operation but don't await it yet
        const solutionPromise = completeSolution().then((result) => {
            isSolutionComplete = true; // Set the flag to true when the operation completes
            return result; // Make sure to return the result for later use
        });

        // Function to do something while waiting
        async function doWhileWaiting() {
            if (!isSolutionComplete) {
                console.log("Solution is still processing...");
                // Do some other work here if needed
                transactions = await getTransactions();
                console.log("transactions: ", transactions);
                // Re-check after some time
                setTimeout(doWhileWaiting, 1000); // Check again after 1 second
            } else {
                console.log("Solution has completed!");
            }
        }

        await doWhileWaiting(); // Start the loop

        // Await the promise when you need the result
        const solutionResult = await solutionPromise;

        // Continue with other code, solutionResult is now available
        console.log("Result of the solution:", solutionResult);
    }
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
    let options = ["target", "sender", "project_id"];
    let selectedOption = options[0]; // Default to first option
    let user = "";
    let revenue = IDL.Nat;
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
    line-height: 1.2;
    "
            >
                Milestone 2: Escrow Demo!
            </h3>
            <br />
            <h4 style="color: black;">Hi viewer!</h4>
            <p style="color: black;">
                Welcome to the escrow canister demo. This canister has around 26
                functions in it! And given we just have 5 minutes to demo, we
                are not going to be able to show them all. Thats why we are
                going to show the most important ones.
            </p>
            <br />
            <br />
            <h3
                style="color: black;
    font-size:25px;
    font-weight:450;
    line-height: 1.2;
    "
            >
                Approve a project
            </h3>
            <br />
            <p style="color: black;">
                --> Your balance: {ICPtoDecimal(userBalance)} ICP tokens
            </p>
            <br />
            <p style="color: black;">
                What you are approving: {ICPtoDecimal(BigInt(0.5 * 1e8))} ICP tokens
            </p>
            <p style="color: black;">
                What you promised: {ICPtoDecimal(BigInt(1.2 * 1e8))} ICP tokens
            </p>
            <br />

            <button
                style="background:white;
                padding: 4px;
                border-color:#ff6000;
                border-width:2px;
                box-shadow: 4px 4px 0px #ff6000;
                color:#ff6000;
                margin-right: 5px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Approving transaction...";
                    await approveTransaction();
                    waiting = false;

                    success = true;
                    successMsg = "Transaction approved successfully!";
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Approve transactions</button
            >
            <button
                style="background:white;
        padding: 4px;
        border-color:#ff6000;
        border-width:2px;
        box-shadow: 4px 4px 0px #ff6000;
        color:#ff6000"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Withdrawing approval...";

                    let result = await removeApproval();

                    waiting = false;
                    successMsg = "Transaction withdrawed successfully!";
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Withdraw approvals</button
            >
            <br />
            <br />
            <p style="color: black;">
                Your current reputation now is: {reputation.number}%
            </p>
            <p style="color: black;">
                You have promised: {reputation.amount_promised} ICP
            </p>
            <p style="color: black;">
                And you have actually paid: {reputation.amount_paid} ICP
            </p>

            <br />
            <p style="color: black;">
                Approvals made by vehbc-zaaaa-aaaal-acyba-cai for project
                T_BVS86cjl7AqpVn0LyDt:
            </p>
            {#each approvals as approval}
                <div class="transaction">
                    <h4>Approval transaction</h4>
                    <p>project id: T_BVS86cjl7AqpVn0LyDt</p>
                    <p>
                        sender principal: {approval.sender.toString()}
                    </p>
                    <p>amount: {approval.amount.toString()}</p>
                    <p>
                        target principal: {approval.target.toString()}
                    </p>
                    <p>
                        transaction_number: {approval.approval_transaction_number.toString()}
                    </p>
                </div>
            {/each}

            <br />
            <button
                style="background:#ff6000;
        padding: 4px;
        border-color:black;
        border-width:1px;"
                on:click={async () => {
                    //waiting = true;
                    approvals = await getApprovals();

                    waiting = false;
                    //success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Check for approvals</button
            >
            <br />
            <br />
            <h3
                style="color: black;
    font-size:25px;
    font-weight:450;
    line-height: 1.2;
    "
            >
                Project completion
            </h3>
            <br />
            <p style="color: black;">
                In this part we mark a project as 'completed' and start
                transfering the tokens from the users wallet to the ideators
                wallet. Additionally, we update the reputation of all those
                users that didnt approved the project.
            </p>
            <p style="color: black;">Your project: X_Vjdoak8jcnaLiKKmoni</p>
            <br />
            <button
                style="background:#ff6000;
        padding: 4px;
        border-color:black;
        border-width:2px;
        box-shadow: 4px 4px 0px black;
        color:black"
                on:click={async () => {
                    //waiting = true;
                    //loadingMsg = "Completion process initializing (claiming tokens)...";
                    await doCompleteSolution();
                    waiting = false;
                    success = true;
                    successMsg =
                        "Solution completed successfully. Check project's transactions.";
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Complete project and claim my tokens!</button
            >
            <br />
            <br />
            <p style="color: black;">
                Transactions made for project X_Vjdoak8jcnaLiKKmoni:
            </p>
            {#each transactions as trans}
                <div class="transaction">
                    <h4>
                        Transaction number {trans.transaction_number}
                    </h4>
                    <p>project id: {trans.project_id}</p>
                    <p>STATUS: {trans.status}</p>
                    <p>sender principal: {trans.sender.toString()}</p>
                    <p>amount: {trans.amount}</p>
                    <p>target principal: {trans.target.toString()}</p>
                    <p>message: {trans.message}</p>
                </div>
            {/each}
            <br />
            <p style="color: black;">
                Search for transactions filtering by target:
            </p>
            <form class="searchBar" style="width: 100%;">
                <input
                    type="text"
                    name="query"
                    placeholder="Search..."
                    style="width: 90%;"
                    bind:value={target}
                />
                <button
                    type="submit"
                    style="background:#ff6000;
                padding: 4px;
                border-color:black;
                border-width:1px;
                color:black"
                    on:click={async () => {
                        switch (selectedOption) {
                            case "target":
                                waiting = true;
                                loadingMsg =
                                    "Looking transactions for target " +
                                    target +
                                    "...";
                                transactions_target =
                                    await getTransactions_byTarget(target);
                                waiting = false;
                                success = true;
                                successMsg =
                                    "Target transactions got successfully!";
                                setTimeout(() => {
                                    success = false;
                                }, 3000);
                                break;
                            case "sender":
                                waiting = true;
                                loadingMsg =
                                    "Looking transactions for sender " +
                                    target +
                                    "...";
                                transactions_target =
                                    await getTransactions_bySender(target);
                                waiting = false;
                                success = true;
                                successMsg =
                                    "Sender transactions got successfully!";
                                setTimeout(() => {
                                    success = false;
                                }, 3000);
                                break;
                            case "project_id":
                                waiting = true;
                                loadingMsg =
                                    "Looking transactions for project " +
                                    target +
                                    "...";
                                transactions_target =
                                    await getTransactions_byProject(target);
                                waiting = false;
                                success = true;
                                successMsg =
                                    "Project transactions got successfully!";
                                setTimeout(() => {
                                    success = false;
                                }, 3000);
                                break;
                        }
                    }}>Search</button
                >
                <select bind:value={selectedOption}>
                    {#each options as option}
                        <option value={option}>{option}</option>
                    {/each}
                </select>
            </form>
            {#each transactions_target as trans}
                <div class="transaction">
                    <h4>
                        Transaction number {trans.transaction_number}
                    </h4>
                    <p>project id: {trans.project_id}</p>
                    <p>STATUS: {trans.status}</p>
                    <p>sender principal: {trans.sender.toString()}</p>
                    <p>amount: {trans.amount}</p>
                    <p>target principal: {trans.target.toString()}</p>
                    <p>message: {trans.message}</p>
                </div>
            {/each}
            <br />
            <p style="color: black;">Search for user total revenue :</p>
            <form class="searchBar" style="width: 100%;">
                <input
                    type="text"
                    name="query"
                    placeholder="Search..."
                    style="width: 90%;"
                    bind:value={user}
                />
                <button
                    type="submit"
                    style="background:#ff6000;
                padding: 4px;
                border-color:black;
                border-width:1px;
                color:black"
                    on:click={async () => {
                        waiting = true;
                        loadingMsg =
                            "Looking the total revenue  made by user " +
                            user +
                            "...";
                        revenue = await getUser_Revenue(user);
                        waiting = false;
                        success = true;
                        successMsg = "User revenue got successfully!";
                        setTimeout(() => {
                            success = false;
                        }, 3000);
                    }}>Search</button
                >
            </form>
            <br />
            {#if revenue != IDL.Nat}
                <p style="color:black">User revenue: {revenue}</p>
            {/if}
            <!-- <button
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
            > -->
            <br />
            <br />
            <!-- <button
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
            > -->
            <!-- <button
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
            > -->
            <!-- <button
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
            > -->
            <!-- <button
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
            <button
                style="background:orangered;
padding: 4px;
border-color:black;
border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Rejecting solution through the admin...";
                    await rejectSolution();
                    successMsg = "Success: Solution rejected";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Reject Solution!</button
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
                }}>Follow user 'fairtale' and increase his followers!</button
            > -->
            <!-- <button
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
                }}>Unfollow 'fairtale'!</button
            > -->
            <!-- <button
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
            > -->
            <!-- <button
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
            > -->
            <!-- <button
                style="background:orangered;
padding: 4px;
border-color:black;
border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg =
                        "Creating new notification through the admin...";
                    await createNotification();
                    successMsg = "Success: Notification created";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Create notification!</button
            >
            <button
                style="background:orangered;
padding: 4px;
border-color:black;
border-width:1px;"
                on:click={async () => {
                    waiting = true;
                    loadingMsg = "Deleting element through the admin...";
                    await deleteElement();
                    successMsg = "Success: Documents deleted";
                    waiting = false;
                    success = true;
                    setTimeout(() => {
                        success = false;
                    }, 3000);
                }}>Delete element!</button
            >-->
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
    .transaction {
        color: black;
        margin-top: 20px;
        font-size: 13px;
        border-width: 2px;
        border-color: #ff6000;
        background-color: rgb(255, 195, 171);
        width: fit-content;
        padding: 5px;
        box-shadow: 6px 6px 0px #ff6000;
    }
    .searchBar {
        color: black;
        margin-top: 20px;
        font-size: 13px;
        border-width: 2px;
        border-color: black;
        background-color: white;
        width: 100%;
        height: fit-content;
        padding-inline: 8px;
        padding-block: 8px;
        box-shadow: 2px 2px 0px black;
    }
    select {
        padding: 8px;
        margin-top: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
</style>
