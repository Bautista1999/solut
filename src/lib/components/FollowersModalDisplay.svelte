<script>
    import Modal from "./modal.svelte";
    import { FollowersModal } from "$lib/stores/other_stores";

    import BasicButton from "./basicButton.svelte";
    import BasicButtonSmall from "./BasicButton_Small.svelte";
    import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
    import { onDestroy, onMount } from "svelte";
    import LoadingModalNew from "./LoadingModalNew.svelte";
    import ErrorModalNew from "./ErrorModalNew.svelte";
    import { getFollowersAndTheirInformation } from "$lib/data_functions/get_functions";
    import FollowerDisplay from "./FollowerDisplay.svelte";
    import ProfilePicture from "./profilePicture.svelte";

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
        let usersReturn = await getFollowersAndTheirInformation(
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
    bind:isOpen={$FollowersModal}
    close={() => {
        FollowersModal.set(false);
    }}
>
    <h2>Followers ({amount})</h2>
    <div class="SmallSeparator">
        {#if !errorFlag}
            {#await getInformation()}
                <LoadingModalNew message={"Loading followers..."} />
            {:then data}
                {#each data as user}
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
</Modal>

<style>
</style>
