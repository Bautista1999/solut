<script>
    import { goto } from "$app/navigation";
    import { getWalletAddress } from "$lib/data_functions/docu.functions";
    import { authSubscribe, initJuno } from "@junobuild/core-peer";
    import { onMount } from "svelte";
    export let wallet_address = "";
    export let principal = "";
    export let user_name = "";
    import { writable } from "svelte/store";
    let copied = writable(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(wallet_address);
        copied.set(true);
        setTimeout(() => {
            copied.set(false);
        }, 3000);
    };
</script>

<div class="wallet">
    <div class="image">
        <img
            src="/assets/LogoSol3.png"
            alt="Twitter Logo"
            style="width: 40px; 
            height: 40px;
            object-fit: contain;"
        />
    </div>
    <div>
        <div class="walletAddress">
            <p>
                {wallet_address.substring(0, 15) +
                    " ... " +
                    wallet_address.substring(35, 42)}
            </p>
            <span class="material-symbols-outlined" on:click={handleCopy}>
                content_copy
            </span>
            {#if $copied}
                <span class="copied-message">Copied!</span>{/if}
        </div>
        <p style="font-weight: 100; font-size:small;">Wallet address</p>
    </div>
    <div>
        <p>
            {#if user_name != ""}
                {user_name}
            {:else}{principal.substring(0, 10) +
                    " ... " +
                    principal.substring(50, 100)}{/if}
        </p>
        <p style="font-weight: 100; font-size:small;">Owner</p>
    </div>
</div>

<style>
    .wallet {
        background-color: var(--tertiary-color);
        width: 90%;
        height: fit-content;
        border: 2px solid var(--primary-color);
        font-size: medium;
        margin-top: 15px;
        box-shadow: 6px 6px 0px 0px var(--primary-color);
        display: flex;
        justify-content: center;
        align-items: left;
        gap: 10px;
        padding: 10px;
        border-radius: 10px;
        flex-direction: column;
        text-align: left;
        justify-content: space-between;
    }
    .image {
        display: flex;
        justify-content: right;
    }
    .walletAddress {
        display: flex;
        align-items: center;
        flex-direction: row;
        text-align: left;
        gap: 10px;
        cursor: pointer;
    }
    .material-symbols-outlined:hover {
        font-variation-settings:
            "FILL" 1,
            "wght" 400,
            "GRAD" 0,
            "opsz" 48;
    }
    .copied-message {
        position: absolute;
        background-color: var(--tertiary-color);
        color: var(--primary-color);
        border-radius: 4px;
        transform: translateY(120%);
        right: 30px;
        z-index: 1000;
        transition: opacity 0.3s ease-in-out;
    }
</style>
