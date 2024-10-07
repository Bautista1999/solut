<script>
    import BasicRoundedButton from "./BasicRoundedButton.svelte";

    let url = "";
    /**
     * @type {{ title: any; description: any; image: any; } | null}
     */
    let metadata = null;
    /**
     * @type {string | null}
     */
    let error = null;
    const apiKey = "34f0ea1b43ff15c735ac955534825ca4";
    const apiEndpoint = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`;

    async function fetchMetadata() {
        const data = { q: url };
        try {
            const response = await fetch("https://api.linkpreview.net", {
                method: "POST",
                headers: {
                    "X-Linkpreview-Api-Key": "34f0ea1b43ff15c735ac955534825ca4", // Your API key here
                    "Content-Type": "application/json",
                },
                mode: "cors",
                body: JSON.stringify(data),
            });

            if (response.status !== 200) {
                error = `Error: ${response.status}`;
                throw new Error(
                    `Something went wrong, status code: ${response.status}`,
                );
            }

            metadata = await response.json();
            error = "";
            console.log("METADATA", metadata); // This is where the metadata will be logged
        } catch (err) {
            console.error("Error fetching metadata:", err);
        }
    }
</script>

<div class="Field">
    <h1 style="margin: 0px;">Fetch Metadata from a URL</h1>

    <input
        class="InputTextSmall"
        placeholder="Enter URL"
        bind:value={url}
        on:keydown={(e) => e.key === "Enter" && fetchMetadata()}
    />
    <BasicRoundedButton
        disabledCondition={null}
        someFunction={fetchMetadata}
        msg={"Get Metadata"}
    />

    {#if error}
        <p style="color: red;">{error}</p>
    {/if}

    {#if metadata}
        <h2>Metadata:</h2>
        <p><strong>Title:</strong> {metadata.title}</p>
        <p><strong>Description:</strong> {metadata.description}</p>
        <p><strong>OG Title:</strong> {metadata.title}</p>
        <p><strong>OG Description:</strong> {metadata.description}</p>
        <p><strong>OG Image:</strong> {metadata.image}</p>
    {/if}
</div>

<style>
    .Field {
        width: 400px;
        display: flex;
        flex-direction: column;
        justify-content: right;
        align-items: left;
        gap: 20px;
    }
</style>
