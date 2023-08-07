<script>
    import Header from "$lib/components/header.svelte";
</script>

<Header />

<div class="body">
    <div class="content">
        <h2 class="h2 text-body">Wallet</h2>
        <div class="card bg-gradient-to-br variant-gradient-primary-tertiary">
            <p class="text-body">This is the wallet</p>
        </div>
        <br />
    </div>
</div>

<style>
    .text-body {
        margin-bottom: 2%;
        width: 100%;
    }
    .card {
        width: 17cm;
        height: 10.8cm;
        border-radius: 20px;
    }
    .body {
        display: flex;
        justify-content: center;
        align-items: flex-start; /* aligns items at the top */
        width: 100%;

        min-height: 100vh;
    }

    .content {
        width: 80%;
        max-width: 800px;
        text-align: left; /* aligns the text to the left */
        height: 12cm;
        margin: 20px auto 0 auto; /* top margin creates space from the top */
    }
    p {
        text-align: center;
    }

    @media (max-width: 768px) {
        .content {
            width: 95%;
        }
        .card {
            width: 95%;
        }
    }
</style>
