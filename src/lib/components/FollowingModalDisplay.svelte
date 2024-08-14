<script>
    import Modal from "./modal.svelte";
    import { FollowingModal } from "$lib/stores/other_stores";

    import BasicButton from "./basicButton.svelte";
    import BasicButtonSmall from "./BasicButton_Small.svelte";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import { onDestroy, onMount } from "svelte";
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    import { getFollowingsAndTheirInformation } from "$lib/data_functions/get_functions";
    import FollowerDisplay from "./FollowerDisplay.svelte";
    import ProfilePicture from "./profilePicture.svelte";
    import FollowedDisplay from "./FollowedDisplay.svelte";

    export let solution_id = "";
    export let idea_id = "";
    export let amount = 0;

    /**
     * @type {string}
     */
    export let elementId;
    let errorFlag = false;
    let errorMsg = "";

    let pages = {
        start: "",
        limit: 12,
    };
    //TODO: Paginate followers: right now we are currently querying the first 12. Once we start getting more followers, we should start to paginate results.
    async function getInformation() {
        let usersReturn = await getFollowingsAndTheirInformation(
            elementId,
            pages,
        );
        /**
         * @type {(import("@junobuild/core-peer").Doc<any>)[]}
         */
        let usersWithoutUndefinedDocs = [];
        for (const user of usersReturn) {
            if (user != undefined) {
                usersWithoutUndefinedDocs.push(user);
                usersWithoutUndefinedDocs = usersWithoutUndefinedDocs;
            }
        }
        return usersWithoutUndefinedDocs;
    }
    onMount(() => {});
</script>

<Modal
    bind:isOpen={$FollowingModal}
    close={() => {
        FollowingModal.set(false);
    }}
>
    <h2>Following ({amount})</h2>
    <div class="SmallSeparator">
        <p class="idea-card-created-at">Showing 12 of {amount}</p>
        <div class="SmallSeparator">
            {#if !errorFlag}
                {#await getInformation()}
                    <LoadingModalNew message={"Loading followers..."} />
                {:then data}
                    {#each data as user}
                        {#if user.key.length == 63 + 6}
                            <FollowerDisplay
                                username={user.description
                                    ? user.description.substring(
                                          9,
                                          user.description?.length,
                                      )
                                    : user.owner}
                                profilePicture={user.data.images[0]}
                                key={user.owner ? user.owner : ""}
                            />
                        {:else}
                            <FollowedDisplay
                                username={user.data.title.length > 30
                                    ? user.data.title.substring(0, 30) + "..."
                                    : user.data.title}
                                profilePicture={user.data.images[0]}
                                key={user.key.substring(6)}
                            />
                        {/if}
                    {/each}
                {/await}
            {:else if errorFlag}
                <ErrorModalNew
                    error={errorMsg}
                    someFunction={() => {
                        errorFlag = false;
                    }}
                />
            {/if}
        </div>
    </div>
</Modal>

<style>
</style>
