<script>
  import BasicRoundedButton from "$lib/components/BasicRoundedButton.svelte";
  import MagicalDotsSmall from "$lib/components/MagicalDotsSmall.svelte";
  import {
    createPledgeImage,
    createPledgeMetatags,
    updateSiteMapxml,
    uploadHTMLToDatabase,
    uploadImageToDatabase,
  } from "$lib/SEO and metadata/metadata_functions";
  import { uploadFile } from "@junobuild/core-peer";
  import { nanoid } from "nanoid";
  import { compile } from "svelte/compiler"; // Import the Svelte compiler

  export let title;
  export let description;
  export let image;
  let msg = "";
  let loading = false;
  async function uploadAsset() {
    loading = true;
    const compiledHTML =
      `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="description" content="Description for some-topic-id" />
    <meta property="og:title" content="Some Topic Title" />
    <meta property="og:description" content="Description for some-topic-id" />
    <meta property="og:image" content="https://cdn.britannica.com/69/228369-050-0B18A1F6/Asian-Cup-Final-2019-Hasan-Al-Haydos-Qatar-Japan-Takumi-Minamino.jpg" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://solutio.one/topics/some-topic-id" />
    <meta name="twitter:title" content="Title example" />
    <meta name="twitter:description" content="Description for some-topic-id" />
    <meta name="twitter:image" content="https://cdn.britannica.com/69/228369-050-0B18A1F6/Asian-Cup-Final-2019-Hasan-Al-Haydos-Qatar-Japan-Takumi-Minamino.jpg" />
    <title>Some Topic Title</title>
  </head>
  <body>
    <noscript>Please enable JavaScript to view the full content.</noscript>

    <div id="app"></div> <!-- The full app will load here for users -->

    <!-- Split the script tag correctly to avoid parsing errors -->
    <scr` +
      `ipt>
      // This JavaScript will load the full Svelte app for users
      window.onload = function() {
        // Load the full Svelte app dynamically
        if (!window.navigator.userAgent.includes("bot") && !window.navigator.userAgent.includes("crawler")) {
      const currentUrl = window.location.href;
      if (!currentUrl.endsWith('/')) {
        window.location.href = currentUrl + '/'; // Redirect to URL with trailing slash
      }
    }
      }
    </scr` +
      `ipt>
  </body>
  </html>`;

    let id = "L5WzdezGu2LFeelUkXwjI";
    const blob = new Blob([compiledHTML], { type: "text/html" });
    const file = new File([blob], id + ".html", {
      type: "text/html",
      lastModified: new Date().getTime(),
    });

    console.log("The size is", file.size);

    // Step 4: Upload the file to Juno's storage
    const result = await uploadFile({
      data: file,
      collection: "topic",
    });
    loading = false;
    // Display the uploaded file's URL
    msg = result.downloadUrl;
  }
  let imagePath = "";
  async function uploadImage() {
    loading = true;
    let imageFile = await createPledgeImage(
      10,
      "Some title",
      "Coti_Dev",
      nanoid(),
    );
    imagePath = await uploadImageToDatabase("pledges", imageFile);
    loading = false;
  }
  let pledgeURL = "";
  async function uploadPledgeAsset() {
    loading = true;
    let id = nanoid();
    let html = await createPledgeMetatags(
      10,
      "Juno Build - Count Docs",
      "Coti_Dev",
      id,
      "Coti_Dev has pledged 10 icp!",
    );
    pledgeURL = await uploadHTMLToDatabase(html, "pledges", id);
    loading = false;
  }

  /**
   * @type { File | null}
   */
  let selectedFile = null;
  let message = "";
  let imageUrl = ""; // This will store the image URL for preview

  // Function to handle file input change
  /**
   * @param {{ target: { files: any[]; value: string; }; }} event
   */
  function handleFileInput(event) {
    const file = event.target.files[0];
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes

    if (file) {
      if (file.size > maxSize) {
        message = "Error: File size exceeds 50MB.";
        selectedFile = null;
        imageUrl = ""; // Clear the image preview
        event.target.value = ""; // Clear the input
      } else {
        selectedFile = file;
        message = `File "${file.name}" is selected. Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;

        // Create an object URL for the selected file for image preview
        imageUrl = URL.createObjectURL(file);
      }
    } else {
      message = "No file selected.";
      selectedFile = null;
      imageUrl = ""; // Clear the image preview
    }
  }

  // Clean up the object URL once the image is removed or replaced
  $: {
    if (!selectedFile) {
      URL.revokeObjectURL(imageUrl);
      imageUrl = "";
    }
  }
</script>

<svelte:head>
  <title>{"Asset test"}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:type" content="website" />
</svelte:head>
<div
  class="content"
  style="display: flex; flex-direction:column; justify-content:center;align-items:center; height:80vh; gap: 40px"
>
  {#if loading}
    <MagicalDotsSmall />
  {:else}
    <div
      style="display:flex; flex-direction:column; align-items: center; justify-content:center; text-align:left; "
    >
      <br />
      <h1>Upload an Image</h1>
      <input type="file" accept="image/*" on:change={handleFileInput} />
      <p>{message}</p>
      {#if selectedFile != null}
        <p>Ready to upload: {selectedFile.name}</p>
        <img src={imageUrl} alt="Image Preview" width="400" />
        <BasicRoundedButton
          disabledCondition={null}
          someFunction={() => {
            loading = true;
            uploadImageToDatabase("solutio-images", selectedFile);
            loading = false;
          }}
          msg={"Upload image to database"}
        />
      {/if}
    </div>

    <a href={msg}>{msg}</a>
    <BasicRoundedButton
      disabledCondition={null}
      someFunction={uploadAsset}
      msg={"Upload file"}
    />

    <a href={imagePath}>{imagePath}</a>
    <BasicRoundedButton
      disabledCondition={null}
      someFunction={uploadImage}
      msg={"Upload pledge image"}
    />

    <a href={pledgeURL}>{pledgeURL}</a>
    <BasicRoundedButton
      disabledCondition={null}
      someFunction={uploadPledgeAsset}
      msg={"Upload pledge html"}
    />
    <!-- <a href={pledgeURL}>{pledgeURL}</a> -->
    <BasicRoundedButton
      disabledCondition={null}
      someFunction={() => updateSiteMapxml("RWUi7R26NWUYafaTzzQWQ")}
      msg={"Update sitemap"}
    />
  {/if}
</div>

<style>
  img {
    margin-top: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
  }
</style>
