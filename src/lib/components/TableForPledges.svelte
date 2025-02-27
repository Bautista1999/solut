<script>
  import { fade, fly } from "svelte/transition";
  import BasicButtonDarkSmall from "./BasicButton_Dark_Small.svelte";
  import { DeleteModal, UserKey } from "$lib/stores/other_stores";
  import { getSolutionStatusFromIdeaId } from "$lib/data_functions/get_functions";
  import ModalConfirmationNew from "./ModalConfirmationNew.svelte";
  import { deletePledgeFromProject } from "$lib/financial_functions/financial_functions";
  import {
    ICPtoDecimal,
    roundUpToThreeDecimalPlaces,
  } from "$lib/financial_functions/financial_functions";
  import { onDestroy, onMount } from "svelte";
  import { getUserPledgesEnriched } from "../../declarations/satellite/satellite.api";
  import { writable } from "svelte/store";

  /**
   * @type {import("../../declarations/satellite/satellite.did").EnrichedPledgeData[]}
   */
  export let pledges = [];
  export let loading = writable(false);
  export let darkMode = false;
  let error = writable(false);
  let success = writable(false);
  let modalErrorMsg = "Something went wrong when canceling the pledge.";

  let renderCount = 0;

  // Monitor renders
  $: {
    renderCount++;
    console.log("TableForPledges rendered:", renderCount, "times");
  }

  // Monitor modal interactions
  function handleModalOpen() {
    console.log("Attempting to open modal from TableForPledges");
    DeleteModal.set(true);
  }

  onMount(() => {
    console.log("TableForPledges mounted");
  });

  onDestroy(() => {
    console.log("TableForPledges destroyed, total renders:", renderCount);
    DeleteModal.set(false);
    error.set(false);
    success.set(false);
  });
  let loading = writable(false);
  /**
   * @type {string}
   */
  let selectedPledgeId = "";

  async function cancelPledge() {
    loading.set(true);
    error.set(false);
    success.set(false);
    const result = await deletePledgeFromProject(selectedPledgeId);
    loading.set(false);
    if ("Ok" in result) {
      success.set(true);
      const activePledges = await getUserPledgesEnriched($UserKey);
      if ("Ok" in activePledges) {
        pledges = activePledges.Ok;
      }
    } else {
      error.set(true);
      modalErrorMsg = result.Err;
    }
  }
</script>

<div class="pledges-wrapper" class:dark-mode={darkMode} transition:fade>
  {#if $loading}
    <div class="loading-state">
      <div class="loader" />
    </div>
  {:else}
    <div class="table-container" transition:fly={{ y: 20, duration: 600 }}>
      <div class="pledge-cards">
        {#each pledges as pledge (pledge.pledge_id)}
          <div
            class="pledge-card glass-effect"
            transition:fly={{ y: 20, duration: 400 }}
          >
            <div class="card-header">
              <img
                src={pledge.idea.profile_image}
                alt={pledge.idea.title}
                class="idea-image"
              />
              <h3>{pledge.idea.title}</h3>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span class="label">Idea</span>
                <div class="value feature-value">
                  {#if pledge.feature.length > 0}
                    <div class="feature-content">
                      <img
                        src={pledge.feature[0]?.profile_image}
                        alt={pledge.feature[0]?.title}
                        class="feature-image"
                      />
                      <span
                        class="truncate-text"
                        title={pledge.feature[0]?.title}
                      >
                        {pledge.feature[0]?.title}
                      </span>
                    </div>
                  {:else}
                    <span>N/A</span>
                  {/if}
                </div>
              </div>
              <div class="info-item">
                <span class="label">Amount</span>
                <span class="value highlight">
                  {roundUpToThreeDecimalPlaces(ICPtoDecimal(pledge.amount))} ICP
                </span>
              </div>
              <div class="info-item">
                <span class="label">Expected</span>
                <span class="value">
                  {roundUpToThreeDecimalPlaces(
                    ICPtoDecimal(pledge.expected_amount)
                  )} ICP
                </span>
              </div>
              <div class="info-item">
                <span class="label">Amount Paid</span>
                <span class="value">
                  {roundUpToThreeDecimalPlaces(
                    ICPtoDecimal(pledge.amount_paid)
                  )} ICP
                </span>
              </div>
              <div class="info-item">
                <span class="label">Status</span>
                <span
                  class="value status-tag"
                  class:active={pledge.status === "active"}
                  class:inactive={pledge.status === "inactive"}
                >
                  {pledge.status}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Payment Type</span>
                <span class="value payment-tag">
                  {pledge.payment_type}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Created</span>
                <span class="value"
                  >{new Date(
                    Number(pledge.created_at) / 1000000
                  ).toLocaleDateString()}</span
                >
              </div>
            </div>
            <div class="card-actions">
              <BasicButtonDarkSmall
                msg="Check idea"
                someFunction={() =>
                  (window.location.href = `/idea/${pledge.feature[0]?.element_id}`)}
              />

              {#if pledge.status === "active"}
                <BasicButtonDarkSmall
                  msg="Cancel Pledge"
                  someFunction={() => {
                    selectedPledgeId = pledge.pledge_id;
                    DeleteModal.set(true);
                  }}
                />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Single modal instance outside the loop -->
{#if selectedPledgeId}
  <ModalConfirmationNew
    message="Are you sure you want to cancel this pledge?"
    someFunction={cancelPledge}
    {error}
    {loading}
    {success}
    errorMsg={modalErrorMsg}
    successMsg="Your pledge was canceled successfully."
    loadingMsg="Deleting pledge..."
  />
{/if}

<style>
  :root {
    --card-padding: 1.25rem;
    --card-border-radius: 16px;
    --card-transition: transform 0.2s ease, box-shadow 0.2s ease;
    --status-active-bg: rgba(40, 167, 69, 0.15);
    --status-active-color: #28a745;
    --status-inactive-bg: rgba(13, 110, 253, 0.15);
    --status-inactive-color: #0d6efd;
  }

  .pledges-wrapper {
    width: 100%;
    margin: 0 0;
    padding-block: 0.5rem;
  }

  .pledge-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    margin-top: 1.5rem;
  }

  .pledge-card {
    display: flex;
    flex-direction: column;
    background: var(--tertiary-color);
    border-radius: var(--card-border-radius);
    overflow: hidden;
    transition: var(--card-transition);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    padding: var(--card-padding);
  }

  .pledge-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      var(--accent-color),
      var(--primary-color)
    );
  }

  .pledge-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }

  .idea-image,
  .feature-image {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .card-header {
    padding: 1.25rem;
    background: var(--secondary-color);
    display: flex;
    align-items: center;
    color: var(--tertiary-color);
    gap: 1.25rem;
  }

  .card-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-color);
    font-weight: 600;
  }

  .card-content {
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .label {
    color: var(--text-secondary);
    font-size: 0.95rem;
    opacity: 0.8;
  }

  .value {
    font-weight: 500;
    color: var(--text-color);
    font-size: 0.95rem;
  }

  .highlight {
    color: var(--accent-color);
    font-weight: 600;
    font-size: 1.1rem;
  }

  .feature-value {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .feature-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .feature-image {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .truncate-text {
    max-width: 150px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;
    line-height: 1.2em;
    height: 2.4em;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
  }

  .status-tag {
    padding: 0.3rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    text-transform: capitalize;
    font-weight: 500;
  }

  .status-tag.active {
    background: var(--status-active-bg);
    color: var(--status-active-color);
  }

  .status-tag.inactive {
    background: var(--status-inactive-bg);
    color: var(--status-inactive-color);
  }

  .payment-tag {
    padding: 0.3rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    text-transform: capitalize;
    background: var(--primary-color);
    color: white;
    font-weight: 500;
  }

  .card-actions {
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 1.25rem;
    justify-content: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .dark-mode .pledge-card {
    background: var(--dark-secondary);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .dark-mode .card-header {
    background: var(--dark-primary);
  }

  .dark-mode .info-item {
    border-color: rgba(255, 255, 255, 0.05);
  }
</style>
