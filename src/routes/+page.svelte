<script>
    import { onMount } from "svelte";
    import { initJuno, signIn, signOut } from "@junobuild/core";
    import { AccountIdentifier as junoAccIdentifier } from "@junobuild/ledger";

    import { authSubscribe, unsafeIdentity } from "@junobuild/core";
    import { ProgressRadial } from "@skeletonlabs/skeleton";
    import { goto } from "$app/navigation";
    import { LightSwitch } from "@skeletonlabs/skeleton";
    import { Principal } from "@dfinity/principal";
    import { IcrcLedgerCanister } from "@dfinity/ledger";
    import { LedgerCanister, AccountIdentifier, ICP } from "@dfinity/nns";
    import { createAgent } from "@dfinity/utils";

    let SignedIn = false;
    let isLoading = false;
    authSubscribe(async (user) => {
        console.log("User:", user);
        // @ts-ignore
        if (user) {
            console.log("Principal:", Principal.fromText(user.key));
            let userPrincipal = Principal.fromText(user.key);

            const junoAccountIdentifier = junoAccIdentifier.fromPrincipal({
                principal: userPrincipal,
            });
            const address = junoAccountIdentifier.toHex();

            console.log("AccountIdentifier: ", junoAccountIdentifier);
            console.log("New wallet Address: ", address);

            //Getting balance
            const identity = await unsafeIdentity();
            const agent = await createAgent({
                // @ts-ignore
                identity,
                host: "https://icp-api.io",
            });
            const ledgerID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

            const { balance } = await IcrcLedgerCanister.create({
                agent: agent,
                canisterId: Principal.fromText(ledgerID),
            });

            const b = await balance({ owner: userPrincipal });
            console.log("Balance: ", b, "ICP tokens");
            const icpInstance = ICP.fromE8s(b);
            console.log(
                "Balance in icp: ",
                icpInstance.toE8s(),
                icpInstance.token.symbol
            );
        }
    });
    onMount(async () => {
        await initJuno({
            satelliteId: "xh6qb-uyaaa-aaaal-acuaq-cai",
        });
    });
    async function LogIn() {
        isLoading = true;
        await signIn();
        SignedIn = true;
        isLoading = false;
        goto("homepage");
    }
    async function LogOut() {
        isLoading = true;
        await signOut();
        SignedIn = false;
        isLoading = false;
    }
</script>

{#if isLoading}
    <div class="card p-4 centered-flexbox" style="width: 30%; height:44%;">
        <ProgressRadial />
    </div>
{:else if SignedIn}
    <div class="card p-4" style="width: 30%; align:center">
        <img
            src="/assets/LogoSol3.png"
            alt=""
            style="width:30%;"
            class="centered-image"
        />
        <br />
        <h1>Successfully signed in!</h1>
        <br />
        <button
            type="button"
            class="btn variant-filled"
            style="border-radius: 1000px; background-color:orangered"
            on:click={LogOut}
        >
            <span>➡️</span>
            <span>Log Out</span>
        </button>
    </div>
{:else}
    <div class="card p-4" style="width: 30%; align:center">
        <img
            src="/assets/LogoSol3.png"
            alt=""
            style="width:30%;"
            class="centered-image"
        />
        <br />
        <h1>Welcome to Solutio</h1>
        <p>
            Visit <a href="https://kit.svelte.dev">solutio.com</a> to learn about
            us
        </p>
        <br />
        <button
            type="button"
            class="btn variant-filled"
            style="border-radius: 1000px; background-color:orangered"
            on:click={LogIn}
        >
            <span>🚀</span>
            <span>Sign In</span>
        </button>
        <div class="light-switch-container">
            <LightSwitch />
        </div>
    </div>
{/if}

<style>
    .light-switch-container {
        display: flex;
        justify-content: center;
    }

    div {
        margin-block-start: 20%;
        text-align: center;
        height: 44%;
    }
    .card {
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 25px;
    }
    .centered-image {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 30%;
    }
    .centered-flexbox {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
