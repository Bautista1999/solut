<script>
    import { goto } from "$app/navigation";
    import Badges from "$lib/components/Badges.svelte";
    import BalanceChart from "$lib/components/BalanceChart.svelte";
    import CardScroller from "$lib/components/CardScroller.svelte";
    import CircledButtonDarkSmall from "$lib/components/CircledButtonDarkSmall.svelte";
    import ErrorMessage from "$lib/components/ErrorMessage.svelte";
    import FlatButtonDarkSmall from "$lib/components/FlatButtonDarkSmall.svelte";
    import LoadingNew from "$lib/components/LoadingNew.svelte";
    import MagicalDotsAbsoluteSmall from "$lib/components/MagicalDotsAbsoluteSmall.svelte";
    import PageTabs from "$lib/components/PageTabs.svelte";
    import ProfilePictureEdit from "$lib/components/ProfilePictureEdit.svelte";
    import Reputation from "$lib/components/Reputation.svelte";
    import TransactionDisplay from "$lib/components/TransactionDisplay.svelte";
    import Wallet from "$lib/components/Wallet.svelte";
    import WithdrawSection from "$lib/components/WithdrawSection.svelte";
    import Loading from "$lib/components/loading.svelte";
    import ProfilePicture from "$lib/components/profilePicture.svelte";
    import { getWalletAddress } from "$lib/data_functions/docu.functions";
    import { usernameExists } from "$lib/data_functions/get_functions.js";
    import { updateUser } from "$lib/data_functions/update_functions";
    import {
        getUserBalance,
        getUserTransactions_bySender,
    } from "$lib/financial_functions/financial_functions";
    import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
    import { Principal } from "@dfinity/principal";
    import {
        authSubscribe,
        getDoc,
        initJuno,
        listDocs,
    } from "@junobuild/core-peer";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";

    /** @type {import('./$types').PageData} */
    export let data;
    let userKey = data.params.user_key;
    let user_name = "erik_thebest";
    let description =
        "Used to build #Apps for corporations Now build #dApps for people  #ProductDesign & #Marketing Founder @SolutioApp";
    let profile =
        "https://png.pngtree.com/thumb_back/fh260/background/20230612/pngtree-in-the-style-of-2d-game-art-image_2884743.jpg";
    let reputation = 50;
    let x_account = "@fairtail3";
    let insta_account = "@fairtail3";
    let linkedIn_account = "Erik Jung";
    let Github_account = "@Fairtale19";
    let wallet_address = "";
    let x_account_edited = "";
    let insta_account_edited = "";
    let linkedIn_account_edited = "";
    let Github_account_edited = "";
    let images = [];

    // State to control whether the input field is visible or not
    let isEditing = false;
    let isLoading = false;
    let error = false;
    let errorMsg = "";

    // State to store the edited username
    // State to store the edited description
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
            // Reset the edited username when exiting editing mode
            editedUserName = "";
            editedDescription = "";
            x_account_edited = "";
            insta_account_edited = "";
            linkedIn_account_edited = "";
            Github_account_edited = "";
        } else {
            // Set the edited username to the current user_name when entering editing mode
            editedUserName = user_name;
            editedDescription = description;
            x_account_edited = x_account;
            insta_account_edited = insta_account;
            linkedIn_account_edited = linkedIn_account;
            Github_account_edited = Github_account;
        }
    }
    let usernameExistance = false;
    // Function to handle saving the edited username
    async function save() {
        user_name = editedUserName; // Update the user_name
        description = editedDescription; // Update the user_name
        x_account = x_account_edited;
        insta_account = insta_account_edited;
        linkedIn_account = linkedIn_account_edited;
        Github_account = Github_account_edited;

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
        if (await usernameExists(user_name, data.params.user_key)) {
            usernameExistance = true;
            setTimeout(() => {
                usernameExistance = false;
            }, 3000);
            return;
        }
        updateUser(user, data.params.user_key);
        toggleEditing(); // Exit editing mode
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
                if (user.key != data.params.user_key) {
                    error = true;
                    errorMsg = "User key doesnt match params!";
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
    <div class="container">
        <div class="UserInfo">
            <div class="VerticallyAligned HorizontallyAligned">
                <br /><br /><br />
                {#if !isEditing}
                    <span>@{user_name}</span>

                    <FlatButtonDarkSmall
                        someFunction={toggleEditing}
                        msg={"Edit profile"}
                    />
                {:else}
                    <input
                        type="text"
                        bind:value={editedUserName}
                        class="InputTextSmall"
                    />
                    {#if usernameExistance}
                        <p
                            style="position:absolute; transform: translateY(180%);
                        left: 120px;
                        z-index: 1000; color:red"
                        >
                            This username already exists!
                        </p>
                    {/if}

                    <div
                        class="VerticallyAligned"
                        style="position: absolute; transform:translateX(170%) translateY(0%); "
                    >
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
            </div>

            <div class="Profile">
                <ProfilePictureEdit src={profile} />
            </div>

            <br />
            <br />

            {#if !isEditing}
                <div class="Description">{description}</div>
            {:else}
                <textarea
                    bind:value={editedDescription}
                    class="Description InputTextSmall"
                    style="width: 95%;
                    height:100px;
                    overflow: hidden;
                    min-height: 40px; /* Minimum height */
                    resize: none; /* Disable resizing */"
                />
            {/if}
        </div>
        <div class="Badges">
            <div class="BudgesTitle">Badges</div>
            <div class="BadgesSection">
                <Badges />
            </div>
        </div>
        <div class="Social-Section">
            <div class="SocialsTitle">Socials</div>
            <div class="SocialsList">
                <div class="SocialsListItem">
                    <div class="iconWrapper">
                        <img
                            src="/assets/11244080_x_twitter_elon musk_twitter new logo_icon.png"
                            alt="Twitter Logo"
                            style="width: 20px; 
            height: 20px;
            object-fit: contain;"
                        />
                    </div>
                    {#if !isEditing}
                        {#if x_account != ""}X:<a href={x_account}
                                >See the account <span
                                    class="material-symbols-outlined"
                                >
                                    touch_app
                                </span>
                            </a>
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
                <div class="SocialsListItem">
                    <div class="iconWrapper">
                        <img
                            src="/assets/1161953_instagram_icon.png"
                            alt="Twitter Logo"
                            style="width: 20px; 
            height: 20px;
            object-fit: contain;"
                        />
                    </div>

                    {#if !isEditing}
                        {#if insta_account != ""}Instagram:<a
                                href={insta_account}
                            >
                                See the account <span
                                    class="material-symbols-outlined"
                                >
                                    touch_app
                                </span>
                            </a>
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
                <div class="SocialsListItem">
                    <div class="iconWrapper">
                        <img
                            src="/assets/394187_github_icon.png"
                            alt="Twitter Logo"
                            style="width: 20px; 
            height: 20px;
            object-fit: contain;"
                        />
                    </div>

                    {#if !isEditing}
                        {#if Github_account != ""}Github:<a
                                href={Github_account}
                                >See the account <span
                                    class="material-symbols-outlined"
                                >
                                    touch_app
                                </span></a
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
                <div class="SocialsListItem">
                    <div class="iconWrapper">
                        <img
                            src="/assets/104493_linkedin_icon.png"
                            alt="Twitter Logo"
                            style="width: 20px; 
            height: 20px;
            object-fit: contain;"
                        />
                    </div>

                    {#if !isEditing}
                        {#if linkedIn_account != ""}LinkedIn: <a
                                href={linkedIn_account}
                            >
                                See the account <span
                                    class="material-symbols-outlined"
                                >
                                    touch_app
                                </span>
                            </a>
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
                <div class="SocialsTitle">Invite link</div>
                <div
                    class=" HorizontallyAligned"
                    style="display: flex;
                align-items: center;
                flex-direction: row;"
                >
                    <p style="text-align: left;">
                        Click here to copy your invite link for other users.
                    </p>
                    <div>
                        <span
                            class="material-symbols-outlined"
                            on:click={handleCopy}
                        >
                            content_copy
                        </span>
                        {#if $copied}
                            <span class="copied-message">Copied!</span>{/if}
                    </div>
                </div>
            </div>
        </div>
        <div class="FinancialInfo">
            Wallet
            <Wallet {wallet_address} {user_name} principal={userKey} />
            <div class="Balance">
                Balance
                {#await getUserBalance(userKey)}
                    <br />
                    <br />
                    <MagicalDotsAbsoluteSmall />
                {:then data}
                    <BalanceChart
                        currencies={[
                            {
                                image: "https://cryptologos.cc/logos/internet-computer-icp-logo.png", // Replace with your image path
                                name: "ICP",
                                value: 12.98,
                                balance: Number(data),
                            },
                        ]}
                    />
                {:catch error}
                    <p>Error: {error.message}</p>
                {/await}
                <WithdrawSection />
            </div>
        </div>

        <div class="Reputation">
            <Reputation {reputation} />
        </div>
        <div class="Transactions">
            <div class="TransactionTitle">Transactions Timeline</div>
            {#await getTransactions()}
                <br />
                <br />
                <MagicalDotsAbsoluteSmall />
            {:then data}
                <div class="TransactionsDisplay">
                    <TransactionDisplay transactions={data} />
                    <!-- <CardScroller /> -->
                </div>
            {:catch error}
                <p>Error: {error.message}</p>
            {/await}
        </div>
    </div>
{:else if error}
    <ErrorMessage
        message={"Couldnt verify account"}
        error={errorMsg}
        someFunction={() => {
            goto("/createaccount/" + userKey);
        }}
    />
{:else}
    <LoadingNew message={"Loading data..."} />
{/if}

<style>
    .container {
        display: grid;
        grid-template-columns: 0.7fr 1.6fr 0.6fr;
        grid-template-rows: 0.3fr 0fr 0fr 0.7fr;
        gap: 0px 10px;
        padding: 20px;
        grid-template-areas:
            "UserInfo Transactions Wallet"
            "Reputation Transactions Wallet"
            "Badges Transactions Balance"
            "Social-Section Transactions Balance";
    }
    .iconWrapper {
        background-color: white;
        width: fit-content;
        padding: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .Transactions {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 0.2fr 0fr 1.5fr 1.5fr;
        gap: 5px 0px;
        grid-template-areas:
            "TransactionTitle TransactionTitle TransactionTitle"
            "TransactionTitle TransactionTitle TransactionTitle"
            "TransactionsDisplay TransactionsDisplay TransactionsDisplay"
            "TransactionsDisplay TransactionsDisplay TransactionsDisplay";
        grid-area: Transactions;
    }
    .TransactionTitle {
        grid-area: TransactionTitle;
        text-align: center;
        margin-block: 15px;
        font-size: larger;
    }
    .TransactionsDisplay {
        grid-area: TransactionsDisplay;
    }

    .UserInfo {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 0fr 0fr 1fr 0fr;
        gap: 10px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "Profile Profile UserName UserName"
            "Profile Profile UserName UserName"
            "Description Description Description Description"
            "Description Description Description Description";
        grid-area: 1 / 1 / 2 / 2;
        height: fit-content;
        padding: 8px;
    }

    .Profile {
        grid-area: Profile;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
    }

    .UserName {
        grid-area: UserName;
        text-align: center;
        display: flex;
        justify-content: left;
        align-items: center;
        padding: 7px;
        gap: 5px;
    }
    .EditButton {
        background-color: transparent;
        border: 0px;
        text-decoration: underline;
        color: var(--primary-color);
        cursor: pointer;
    }
    .EditButton:hover {
        background-color: transparent;
        border: 0px;
        text-decoration: underline;
        color: var(--sedondary-color);
    }

    .Description {
        grid-area: Description;
        padding: 5px;
    }

    .Badges {
        display: grid;
        grid-template-columns: 0fr 1fr 0fr;
        grid-template-rows: 0fr 0fr 0fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "BudgesTitle BudgesTitle BudgesTitle"
            "BadgesSection BadgesSection BadgesSection"
            "BadgesSection BadgesSection BadgesSection";
        grid-area: 3 / 1 / 4 / 2;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .BudgesTitle {
        grid-area: BudgesTitle;
        text-align: center;
        padding-block: 15px;
        font-size: larger;
    }

    .BadgesSection {
        grid-area: BadgesSection;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .Social-Section {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 0fr 0fr 0fr;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "SocialsTitle SocialsTitle SocialsTitle"
            "SocialsList SocialsList SocialsList"
            "SocialsList SocialsList SocialsList";
        grid-area: 4 / 1 / 5 / 2;
    }

    .SocialsTitle {
        grid-area: SocialsTitle;
        text-align: center;
        padding-block: 15px;
        font-size: larger;
    }

    .SocialsList {
        grid-area: SocialsList;
    }
    .SocialsListItem {
        display: flex;
        align-items: center;
        gap: 15px;
        margin: 10px;
    }

    .FinancialInfo {
        grid-area: 1 / 3 / 3 / 4;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        font-size: larger;
        padding-top: 15px;
        height: fit-content;
    }

    .Balance {
        grid-area: 3 / 3 / 5 / 4;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
        font-size: large;
        margin-block: 20px;
    }

    .Reputation {
        align-self: center;
        grid-area: 2 / 1 / 3 / 2;
    }
    .copied-message {
        position: absolute;
        color: var(--primary-color);
        border-radius: 4px;
        transform: translateY(10%) translateX(10%);
        z-index: 1000;
        transition: opacity 0.3s ease-in-out;
    }
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0;
        cursor: pointer;
    }
    .material-symbols-outlined:hover {
        font-variation-settings: "FILL" 1;
        cursor: pointer;
    }
</style>
