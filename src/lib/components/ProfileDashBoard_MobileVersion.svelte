<script>
    import { writable } from "svelte/store";
    import Badges from "$lib/components/Badges.svelte";
    import BalanceChart from "$lib/components/BalanceChart.svelte";
    import CircledButtonDarkSmall from "$lib/components/CircledButtonDarkSmall.svelte";
    import FlatButtonDarkSmall from "$lib/components/FlatButtonDarkSmall.svelte";
    import Reputation from "$lib/components/Reputation.svelte";
    import TransactionDisplay from "$lib/components/TransactionDisplay.svelte";
    import Wallet from "$lib/components/Wallet.svelte";
    import WithdrawSection from "$lib/components/WithdrawSection.svelte";
    import ProfilePictureEdit from "$lib/components/ProfilePictureEdit.svelte";
    import { goto } from "$app/navigation";
    import {
        getUserBalance,
        getUserTransactions_bySender,
    } from "$lib/financial_functions/financial_functions";
    import { authSubscribe, getDoc, listDocs } from "@junobuild/core-peer";
    import { onMount } from "svelte";
    import { Principal } from "@dfinity/principal";
    import { getWalletAddress } from "$lib/data_functions/docu.functions";
    import { usernameExists } from "$lib/data_functions/get_functions.js";
    import { updateUser } from "$lib/data_functions/update_functions";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import MagicalDotsAbsoluteSmall from "./MagicalDotsAbsolut.svelte";
    import ErrorMessage from "./ErrorMessage.svelte";
    import LoadingNew from "./LoadingNew.svelte";

    let activeTab = writable("Information");

    /**
     * @type {string}
     */
    export let data;
    let userKey = data;
    let user_name = "";
    let description = "";
    $: profile = "";
    let reputation = 50;
    let x_account = "";
    let insta_account = "";
    let linkedIn_account = "";
    let Github_account = "";
    let wallet_address = "";
    let x_account_edited = "";
    let insta_account_edited = "";
    let linkedIn_account_edited = "";
    let Github_account_edited = "";

    let isEditing = false;
    let isLoading = false;
    let error = false;
    let errorMsg = "";

    let editedDescription = "";
    let editedUserName = "";
    let copied = writable(false);

    const handleCopy = () => {
        const textToCopy = `${location.origin}/signin/${userKey}`;
        navigator.clipboard.writeText(textToCopy);
        copied.set(true);
        setTimeout(() => {
            copied.set(false);
        }, 3000);
    };

    /**
     * @type {import("@junobuild/core-peer").Doc.<any>}
     */
    let userData = {
        key: "",
        data: {},
    };

    function toggleEditing() {
        isEditing = !isEditing;
        if (!isEditing) {
            editedUserName = "";
            editedDescription = "";
            x_account_edited = "";
            insta_account_edited = "";
            linkedIn_account_edited = "";
            Github_account_edited = "";
        } else {
            editedUserName = user_name;
            editedDescription = description;
            x_account_edited = x_account;
            insta_account_edited = insta_account;
            linkedIn_account_edited = linkedIn_account;
            Github_account_edited = Github_account;
        }
    }

    let usernameExistance = false;

    async function save() {
        user_name = editedUserName == "" ? user_name : editedUserName;
        description = editedDescription == "" ? description : editedDescription;
        x_account = x_account_edited == "" ? x_account : x_account_edited;
        insta_account =
            insta_account_edited == "" ? insta_account : insta_account_edited;
        linkedIn_account =
            linkedIn_account_edited == ""
                ? linkedIn_account
                : linkedIn_account_edited;
        Github_account =
            Github_account_edited == ""
                ? Github_account
                : Github_account_edited;
        /**
         * @type {import("$lib/data_objects/data_types").user}
         */
        let user = {
            username: user_name,
            profilePicture: profile,
            // @ts-ignore
            images: userData.images,
            // @ts-ignore
            videos: userData.videos,
            // @ts-ignore
            sex: userData.sex,
            // @ts-ignore
            country: userData.country,

            description: description,
            // @ts-ignore
            categories: userData.categories,
            xAccount: x_account,
            instaAccount: insta_account,
            GitHubAccount: Github_account,
            linkedInAccount: linkedIn_account,
            linkPage: "",
            otherlinks: [],
        };

        if (await usernameExists(user_name, userKey)) {
            usernameExistance = true;
            setTimeout(() => {
                usernameExistance = false;
            }, 3000);
            return;
        }

        updateUser(user, userKey);
        isEditing = false;
    }

    onMount(async () => {
        isLoading = true;
        if (!(await CheckIfSignedIn())) {
            goto("/signin/");
        }
        authSubscribe(async (user) => {
            if (user == null) {
            } else {
                userKey = user.key;
                if (user.key != userKey) {
                    error = true;
                    errorMsg = "User key doesn't match params!";
                } else {
                    let userDoc = await getDoc({
                        collection: "user",
                        key: user.key,
                    });
                    if (userDoc === undefined) {
                        error = true;
                        errorMsg = "User not registered";
                        goto("/createaccount/" + userKey);
                    } else {
                        userData = userDoc.data;
                        let data = userDoc.data;
                        user_name = data.username;
                        profile = data.profilePicture;
                        description = data.description;
                        x_account = data.xAccount;
                        insta_account = data.instaAccount;
                        Github_account = data.GitHubAccount;
                        linkedIn_account = data.linkedInAccount;
                        wallet_address = await getWalletAddress(userKey);
                    }
                }

                isLoading = false;
            }
        });
    });

    async function getTransactions() {
        /** @type {Array<import("$lib/declarations/escrow_declarations").Transaction>} */
        let transactions = await getUserTransactions_bySender(userKey);

        let pledges = await listDocs({
            collection: "pledges_active",
            filter: {
                matcher: {
                    description: userKey,
                },
            },
        });
        console.log("plegdes: ", pledges);
        if (Number(pledges.items_length) == 0) {
            return transactions;
        } else {
            for (let i = 0; i < pledges.items_length; i++) {
                /**
                 * @type {[bigint]}
                 */
                let _number = [0n];
                if (typeof pledges.items[i].created_at == "bigint") {
                    // @ts-ignore
                    _number = [pledges.items[i].created_at];
                }
                /** @type {import("$lib/declarations/escrow_declarations").Transaction} */
                let newTransaction = {
                    status: "Success",
                    sender: Principal.fromText(userKey),
                    target:
                        pledges.items[i].data.feature_id ||
                        pledges.items[i].data.idea_id,
                    trans_type: "Pledge",
                    to: [],
                    from: [],
                    message: "",
                    project_id: pledges.items[i].data.idea_id,
                    transaction_number: _number,
                    created_at: _number[0],
                    amount: pledges.items[i].data.amount,
                };
                transactions.push(newTransaction);
                transactions = transactions;
            }
        }
        transactions = transactions.sort(
            (a, b) => Number(a.created_at) - Number(b.created_at),
        );
        return transactions;
    }
</script>

{#if !isLoading && !error}
    <div class="profile-container">
        <div class="profile-header">
            <ProfilePictureEdit
                bind:src={profile}
                someFunction={() => {
                    save();
                }}
            />
            <div class="profile-info">
                {#if !isEditing}
                    <div class="user-info">
                        <span style="font-weight: 500;">@{user_name}</span>
                        <p class="user-key">{userKey}</p>
                    </div>
                {:else}
                    <div
                        style="display: flex; flex-direction:row; align-items:center; justify-content:space-between; gap:10px;"
                    >
                        <input
                            type="text"
                            bind:value={editedUserName}
                            class="InputTextSmall"
                        />
                        <CircledButtonDarkSmall
                            someFunction={save}
                            icon={"Save"}
                        />
                        <CircledButtonDarkSmall
                            someFunction={toggleEditing}
                            icon={"Cancel"}
                        />
                    </div>
                {/if}
                {#if usernameExistance}
                    <p class="error-message">This username already exists!</p>
                {/if}
            </div>
        </div>
        <div class="SmallSeparator">
            {#if !isEditing}
                <div class="description">
                    {description}
                </div>
            {:else}
                <textarea
                    bind:value={editedDescription}
                    class=" InputTextSmall"
                />
            {/if}
            {#if !isEditing}
                <FlatButtonDarkSmall
                    someFunction={toggleEditing}
                    msg={"Edit profile"}
                />
            {/if}
        </div>

        <br />
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="tabs">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                class="tab"
                class:active={$activeTab === "Information"}
                on:click={() => activeTab.set("Information")}
            >
                Information
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                class="tab"
                class:active={$activeTab === "Transactions"}
                on:click={() => activeTab.set("Transactions")}
            >
                Transactions
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                class="tab"
                class:active={$activeTab === "Wallet"}
                on:click={() => activeTab.set("Wallet")}
            >
                Wallet
            </div>
        </div>
        {#if $activeTab === "Information"}
            <div class="information">
                <Reputation {reputation} />
                <!-- <div class="badges">
                    <div class="badges-title">Badges</div>
                    <Badges />
                </div> -->
                <div class="social-section">
                    <div class="socials-title">Socials</div>
                    <div class="socials-list">
                        <div class="socials-list-item">
                            <div class="iconWrapper">
                                <img
                                    src="/assets/11244080_x_twitter_elon musk_twitter new logo_icon.png"
                                    alt="Twitter Logo"
                                />
                            </div>
                            {#if !isEditing}
                                {#if x_account != ""}X:<a href={x_account}
                                        >See the account <span
                                            class="material-symbols-outlined"
                                            >touch_app</span
                                        ></a
                                    >
                                {:else}
                                    <p>- No link added -</p>
                                {/if}
                            {:else}
                                <input
                                    type="text"
                                    bind:value={x_account_edited}
                                    class="InputTextSmall"
                                />
                            {/if}
                        </div>
                        <div class="socials-list-item">
                            <div class="iconWrapper">
                                <img
                                    src="/assets/1161953_instagram_icon.png"
                                    alt="Instagram Logo"
                                />
                            </div>
                            {#if !isEditing}
                                {#if insta_account != ""}Instagram:<a
                                        href={insta_account}
                                        >See the account <span
                                            class="material-symbols-outlined"
                                            >touch_app</span
                                        ></a
                                    >
                                {:else}
                                    <p>- No link added -</p>
                                {/if}
                            {:else}
                                <input
                                    type="text"
                                    bind:value={insta_account_edited}
                                    class="InputTextSmall"
                                />
                            {/if}
                        </div>
                        <div class="socials-list-item">
                            <div class="iconWrapper">
                                <img
                                    src="/assets/394187_github_icon.png"
                                    alt="GitHub Logo"
                                />
                            </div>
                            {#if !isEditing}
                                {#if Github_account != ""}GitHub:<a
                                        href={Github_account}
                                        >See the account <span
                                            class="material-symbols-outlined"
                                            >touch_app</span
                                        ></a
                                    >
                                {:else}
                                    <p>- No link added -</p>
                                {/if}
                            {:else}
                                <input
                                    type="text"
                                    bind:value={Github_account_edited}
                                    class="InputTextSmall"
                                />
                            {/if}
                        </div>
                        <div class="socials-list-item">
                            <div class="iconWrapper">
                                <img
                                    src="/assets/104493_linkedin_icon.png"
                                    alt="LinkedIn Logo"
                                />
                            </div>
                            {#if !isEditing}
                                {#if linkedIn_account != ""}LinkedIn: <a
                                        href={linkedIn_account}
                                        >See the account <span
                                            class="material-symbols-outlined"
                                            >touch_app</span
                                        ></a
                                    >
                                {:else}
                                    <p>- No link added -</p>
                                {/if}
                            {:else}
                                <input
                                    type="text"
                                    bind:value={linkedIn_account_edited}
                                    class="InputTextSmall"
                                />
                            {/if}
                        </div>
                        <div class="socials-title">Invite link</div>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="invite-link" on:click={handleCopy}>
                            <p>
                                Click here to copy your invite link for other
                                users.
                            </p>
                            <span class="material-symbols-outlined"
                                >content_copy</span
                            >
                            {#if $copied}
                                <span class="copied-message">Copied!</span>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {:else if $activeTab === "Transactions"}
            <div class="transactions">
                <div class="TransactionTitle">Transactions Timeline</div>
                {#await getTransactions()}
                    <br />
                    <br />
                    <MagicalDotsAbsoluteSmall />
                {:then data}
                    <TransactionDisplay transactions={data} />
                {:catch error}
                    <p>Error: {error.message}</p>
                {/await}
            </div>
        {:else if $activeTab === "Wallet"}
            <div class="wallet">
                <h3>Wallet information</h3>
                <Wallet {wallet_address} {user_name} principal={userKey} />
                <div class="balance">
                    <h3>Balance</h3>
                    {#await getUserBalance(userKey)}
                        <br />
                        <br />
                        <MagicalDotsAbsoluteSmall />
                    {:then data}
                        <BalanceChart
                            currencies={[
                                {
                                    image: "https://cryptologos.cc/logos/internet-computer-icp-logo.png",
                                    name: "ICP",
                                    value: 12.98,
                                    balance: Number(data),
                                },
                            ]}
                        />
                    {:catch error}
                        <p>Error: {error.message}</p>
                    {/await}
                </div>
                <h3>Withdraw</h3>
                <WithdrawSection />
            </div>
        {/if}
    </div>
{:else if error}
    <ErrorMessage
        message={"Couldn't verify account"}
        error={errorMsg}
        someFunction={() => goto("/createaccount/" + userKey)}
    />
{:else}
    <LoadingNew message={"Loading data..."} />
{/if}

<style>
    .profile-container {
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    .profile-header {
        display: flex;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--forth-color);
        margin-bottom: 10px;
    }

    .profile-info {
        display: flex;
        flex-direction: column;
        margin-left: 10px;
    }

    .user-info {
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .user-key {
        font-size: x-small;
        width: 70%;
        color: grey;
    }

    .description {
        font-size: medium;
    }

    .description-input {
        width: 100%;
        padding: 5px;
        min-height: 40px;
        resize: none;
    }

    .tabs {
        display: flex;
        justify-content: space-around;
        margin-bottom: 10px;
    }

    .tab {
        flex: 1;
        text-align: center;
        padding: 10px;
        border-bottom: 2px solid var(--secondary-color);
        cursor: pointer;
    }

    .tab.active {
        border-bottom: 2px solid var(--primary-color);
    }

    .information,
    .transactions,
    .wallet {
        padding: 10px;
    }
    .transactions,
    .wallet {
        padding-block: 0px;
    }

    .badges-title,
    .socials-title,
    .invite-link {
        font-size: larger;
        text-align: left;
        margin-top: 15px;
    }

    .socials-list {
        margin-top: 10px;
    }

    .socials-list-item {
        display: flex;
        align-items: center;
        gap: 15px;
        margin: 5px 0;
    }

    .invite-link {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
    }

    .copied-message {
        color: var(--primary-color);
        position: absolute;
        right: 5px;
        transform: translateY(30px);
    }

    .transactions {
        text-align: center;
    }

    .balance {
        margin-top: 20px;
    }

    .error-message {
        color: red;
    }

    .iconWrapper {
        width: fit-content;
        padding: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .iconWrapper img {
        width: 20px;
        height: 20px;
        object-fit: contain;
    }
</style>
