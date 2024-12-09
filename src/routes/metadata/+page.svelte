<script>
  import BasicRoundedButton from "$lib/components/BasicRoundedButton.svelte";
  import MagicalDotsSmall from "$lib/components/MagicalDotsSmall.svelte";
  import MetadataSearcher from "$lib/components/MetadataSearcher.svelte";
  import {
    createPledgeImage,
    createPledgeMetatags,
    updateSiteMapxml,
    uploadHTMLToDatabase,
    uploadImageToDatabase,
  } from "$lib/SEO and metadata/metadata_functions";
  import { uploadFile, initSatellite } from "@junobuild/core-peer";
  import { nanoid } from "nanoid";
  import { onMount } from "svelte";
  import { compile } from "svelte/compiler"; // Import the Svelte compiler
  import {
    createNewProduct,
    deleteManyImages,
    deletePledge,
    eliminateIdea,
    eliminateSolution,
    eliminateTopic,
    getAvailableBalance,
    getFundingDetails,
    getPaginatedIdeas,
    getPaginatedIdeasBySolution,
    getPaginatedTopics,
    getPaginatedUsers,
    getTotalFollowers,
    getTotalPledged,
    getTotalPledgedAndExpected,
    getUserActivePledges,
    getUserRealBalance,
    getUserReputation,
    getUserUsername,
    queryScheduledTasksState,
    sendSingleNotification,
    startScheduledTasks,
    stopScheduledTasks,
    triggerDeleteOrphanIdeas,
    triggerDeleteOrphanSolutions,
    triggerDeleteUnusedImages,
    validateUserBalanceOrDeletePledge,
  } from "../../declarations/satellite/satellite.api";
  import { signIn, NFIDProvider, authSubscribe } from "@junobuild/core";
  import SearchBarLarger from "$lib/components/SearchBarLarger.svelte";
  import SearchBar from "$lib/components/SearchBar.svelte";
  import ImageUploader from "$lib/components/ImageUploader.svelte";
  import QuillTextEditor from "$lib/components/QuillTextEditor.svelte";
  import {
    getActivePledges,
    getTotalPledgedBalance,
  } from "$lib/financial_functions/financial_functions";
  import { UserKey } from "$lib/stores/other_stores";
  import { AccountIdentifier } from "@dfinity/ledger-icp";
  import { Principal } from "@dfinity/principal";

  export let title;
  export let description;
  export let image;
  let msg = "";
  let loading = false;
  async function triggerServerlessFunction() {
    loading = true;
    // console.log(await getListDocs("idea"));
    loading = false;
  }
  async function newProduct() {
    loading = true;
    /**
     * @typedef {import("../../declarations/satellite/satellite.did").Product}
     */
    let product = {
      name: "Juno",
      link: "https://juno.build",
      description: "Juno is a blockchainless platform",
      company: ["Juno"],
      owner: [],
      score: [],
      image: [
        "https://pbs.twimg.com/profile_images/1621262585852051456/MySlUBIN_400x400.jpg",
      ],
    };
    // @ts-ignore
    await createNewProduct(product, nanoid());
    loading = false;
  }
  async function uploadAsset() {
    loading = true;

    // onMount(async () => {
    //   await initSatellite({
    //     satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
    //     workers: { auth: true },
    //   });
    // });
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
  onMount(async () => {
    await initSatellite({ satelliteId: "svftd-daaaa-aaaal-adr3a-cai" });
    console.log("Initialized");
  });
  async function NFIDSignIn() {
    await signIn({
      provider: new NFIDProvider({
        appName: "Solutio",
        logoUrl: "https://solutio.one/assets/LogoSol3.png",
      }),
    });
    let unsubscribe = authSubscribe((user) => {
      console.log("User:", user);
    });
  }
  async function InternetIdentitySignIn() {
    // await initSatellite({ satelliteId: "svftd-daaaa-aaaal-adr3a-cai" });
    await signIn();
    let unsubscribe = authSubscribe((user) => {
      console.log("User:", user);
    });
  }
  $: solutionId = "";

  async function deleteSolution() {
    loading = true;
    console.log(await eliminateSolution(solutionId));
    loading = false;
  }
  /**
   * @type { File}
   */
  let selectedFile;
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

  let pledgeId = "";
  async function deletePledgeFromId() {
    loading = true;
    console.log(await deletePledge(pledgeId));
    loading = false;
  }

  let ideaId = "";
  async function deleteIdeafromId() {
    loading = true;
    console.log(await eliminateIdea(ideaId));
    loading = false;
  }

  let topicId = "";
  async function deleteTopicfromId() {
    loading = true;
    console.log(await eliminateTopic(topicId));
    loading = false;
  }

  let newImage = "";
  // Array to store uploaded image names
  /**
   * @type {string[]}
   */
  $: uploadedImageNames = [];

  /**
   * Adds an uploaded image name to the tracking array.
   * @param {string} imageName - The name of the uploaded image.
   */
  function addImageName(imageName) {
    uploadedImageNames.push(imageName);
    newImage = "";
    console.log(`Added image: ${imageName}`);
    console.log("Current images list:", uploadedImageNames);
  }

  /**
   * Deletes all images in the `uploadedImageNames` array by calling `deleteManyImages`.
   * Resets the array upon successful deletion.
   */
  async function deleteAllUploadedImages() {
    loading = true;
    if (uploadedImageNames.length === 0) {
      console.log("No images to delete.");
      return;
    }

    try {
      const response = await deleteManyImages("images", uploadedImageNames); // Assuming "images" is your collection name

      if ("Ok" in response) {
        console.log("Images deleted successfully:", response.Ok);
        uploadedImageNames = []; // Clear the array after deletion
      } else if ("Err" in response) {
        console.error("Failed to delete images:", response.Err);
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
    }
    loading = false;
  }

  let taskState = "Unknown";

  async function startTasks() {
    const result = await startScheduledTasks();
    taskState = `Started: ${result}`;
    console.log(result);
  }

  async function stopTasks() {
    const result = await stopScheduledTasks();
    taskState = `Stopped: ${result}`;
    console.log(result);
  }

  async function checkTaskState() {
    const state = await queryScheduledTasksState();
    taskState = state;
    console.log(state);
  }
  $: principalInput = "";
  $: hexOutput = "";
  async function fromPrincipaltoHex() {
    const principal = Principal.fromText(principalInput);
    const accountIdentifier = AccountIdentifier.fromPrincipal({
      principal: principal,
    });
    hexOutput = accountIdentifier.toHex();
    return hexOutput;
  }

  $: userId = "";
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
  style="display: flex; flex-direction:column; justify-content:center;align-items:center;  gap: 30px;height:fit-content; padding-block:20px;"
>
  {#if loading}
    <MagicalDotsSmall />
  {:else}
    <div class="Field">
      <h1 style="margin: 0px;">Upload an Image</h1>
      <input type="file" accept="image/*" on:change={() => handleFileInput} />
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
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={uploadAsset}
        msg={"Upload Image"}
      />
    </div>

    <MetadataSearcher />

    <div class="Field">
      <h1 style="margin:0px;">Eliminate a specified solution</h1>
      <input
        class="InputTextSmall"
        placeholder="Enter ID of the solution"
        bind:value={solutionId}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          await deleteSolution();
        }}
        msg={"Eliminate solution"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Sign In with NFID</h1>

      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          await NFIDSignIn();
        }}
        msg={"NFID Sign in"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Sign In with Internet Identity (new one)</h1>

      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          await InternetIdentitySignIn();
        }}
        msg={"Internet Identity Sign in"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Delete pledge</h1>
      <input
        class="InputTextSmall"
        placeholder="Enter ID of the pledge"
        bind:value={pledgeId}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          await deletePledgeFromId();
        }}
        msg={"Delete pledge"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Delete idea</h1>
      <input
        class="InputTextSmall"
        placeholder="Enter ID of the idea"
        bind:value={ideaId}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          await deleteIdeafromId();
        }}
        msg={"Delete idea"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Delete topic</h1>
      <input
        class="InputTextSmall"
        placeholder="Enter ID of the topic"
        bind:value={topicId}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          await deleteTopicfromId();
        }}
        msg={"Delete topic"}
      />
    </div>

    <div class="Field">
      <h1 style="margin:0px;">Delete images</h1>
      <input
        class="InputTextSmall"
        placeholder="Enter full path of the image"
        bind:value={newImage}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={() => {
          addImageName(newImage);
        }}
        msg={"Push image to delete"}
      />

      {#if uploadedImageNames.length > 0}
        {#each uploadedImageNames as file}
          <div class="fileItem">
            <p>{file}</p>
          </div>
        {/each}
        <BasicRoundedButton
          disabledCondition={null}
          someFunction={async () => {
            await deleteAllUploadedImages();
          }}
          msg={"Delete images"}
        />
      {/if}
    </div>
    <div class="Field">
      <ImageUploader />
    </div>

    <div class="Field">
      <h1 style="margin:0px;">Scheduled Functions</h1>

      <BasicRoundedButton
        disabledCondition={null}
        someFunction={startTasks}
        msg={"Schedule Daily Functions"}
      />

      <BasicRoundedButton
        disabledCondition={null}
        someFunction={stopTasks}
        msg={"Stop Daily Functions"}
      />

      <BasicRoundedButton
        disabledCondition={null}
        someFunction={checkTaskState}
        msg={"Check Task Status"}
      />

      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await triggerDeleteUnusedImages());
        }}
        msg={"Trigger delete unused images function"}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await triggerDeleteOrphanIdeas());
        }}
        msg={"Trigger delete orphan ideas function"}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await triggerDeleteOrphanSolutions());
        }}
        msg={"Trigger delete orphan solutions function"}
      />

      <p>Task Status: {taskState}</p>
    </div>

    <div class="Field">
      <h1 style="margin:0px;">Quill text editor</h1>
      <QuillTextEditor />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Active pledges</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await getActivePledges());
        }}
        msg={"Get those active pledges!"}
      />

      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await getTotalPledgedBalance());
        }}
        msg={"Get pledged balance!"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">User balance</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await getUserRealBalance($UserKey));
        }}
        msg={"Get Signed in user balance"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">User available balance</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await getAvailableBalance($UserKey));
        }}
        msg={"Get Signed in user available balance"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">User reputation</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          let result = 0;
          try {
            let reputation = await getUserReputation(
              Principal.fromText($UserKey),
            );
            if ("Ok" in reputation) {
              result = Number(reputation.Ok);
            } else {
              alert("Error: " + String(reputation.Err));
            }
          } catch (e) {
            alert("Error: " + String(e));
          }
          console.log(result);
        }}
        msg={"Get Signed in user reputation"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">From Principal to HEX</h1>
      <input
        class="InputTextSmall"
        placeholder="Paste your principal here..."
        bind:value={principalInput}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await fromPrincipaltoHex());
        }}
        msg={"Transform principal"}
      />
      <p>Output: {hexOutput}</p>
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Send single notification</h1>

      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          let sender =
            "2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae";
          let receiver =
            "2dgol-6t7gr-wbceo-axkyn-3qinp-vxv32-zrqbv-oj6tr-ztuvk-el3ln-3ae";
          let notification = {
            title: "Notification's title",
            subtitle:
              "Notification's subtitle, which needs to be kind of long to test it.",
            description:
              "Notification's description, which needs to be kind of long to test it on the interface. That's why this field should be as loooong as possible.",
            imageURL:
              "https://img.freepik.com/premium-photo/cool-wallpaper-landscape-background_915164-76494.jpg",
            linkURL: "/metadata",
            sender: sender,
            typeOf: "Test",
            read: false,
          };
          console.log(
            await sendSingleNotification(sender, receiver, notification),
          );
        }}
        msg={"Send notification"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Get user's username</h1>
      <input
        class="InputTextSmall"
        placeholder="Paste the user id here..."
        bind:value={userId}
      />
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await getUserUsername(userId));
        }}
        msg={"Query username"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Get Topic's total funding information</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(
            await getFundingDetails("solution", "Ggpkso6QiqjK0LhJn1Er0"),
          );
        }}
        msg={"Total funding information!"}
      />
    </div>
    <div class="Field">
      <h1 style="margin:0px;">Get Topic's total followers</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await getTotalFollowers("5Yd5E2LTG76N9RYYr8oGV"));
        }}
        msg={"Total followers!"}
      />
    </div>

    <div class="Field">
      <h1 style="margin:0px;">Get paginated topics</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(await getPaginatedTopics("most_pledged", [], [], []));
        }}
        msg={"Most pledged topics!"}
      />
    </div>

    <div class="Field">
      <h1 style="margin:0px;">Get paginated users</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(
            await getPaginatedUsers("most_followed", [], [], ["Coti"]),
          );
        }}
        msg={"Most followed users!"}
      />
    </div>

    <div class="Field">
      <h1 style="margin:0px;">Get paginated ideas by solution</h1>
      <BasicRoundedButton
        disabledCondition={null}
        someFunction={async () => {
          console.log(
            await getPaginatedIdeasBySolution(
              "most_followed",
              [],
              [],
              [],
              "-cv1BN9Zvs4g4--mpu4Cp",
            ),
          );
        }}
        msg={"Implemented ideas by solution"}
      />
    </div>
  {/if}
</div>

<style>
  img {
    margin-top: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
  }
  .Field {
    width: 400px;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: right;
    align-items: left;
    gap: 20px;
  }
  .horizontalCard {
    display: flex;
    flex-direction: row;
    padding-inline: 10px;
    padding-block: 5px;
    align-self: center;
    height: fit-content;
    gap: 10px;
    background-color: var(--tertiary-color);
    border: 1px solid var(--seventh-color);
    width: 700px;
    text-decoration: none;
  }
  .horizontalCard img {
    width: 20%;
    border: none;
    margin: 0;
  }
  .horizontalCard h4 {
    width: 30%;
  }
  .horizontalCard p {
    text-align: center;
    width: 25%;
  }
</style>
