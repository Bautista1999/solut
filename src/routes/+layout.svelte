<script>
  // Your selected Skeleton theme:
  import "@skeletonlabs/skeleton/themes/theme-skeleton.css";

  // This contains the bulk of Skeletons required styles:
  import "@skeletonlabs/skeleton/styles/skeleton.css";

  // Finally, your application's global stylesheet (sometimes labeled 'app.css')
  import "../app.postcss";
  import "@skeletonlabs/skeleton/themes/theme-rocket.css";
  import { onMount } from "svelte";
  import { basicInfo, info, initDB } from "$lib/stores/auth.state";
  import Header from "$lib/components/header.svelte";
  import { count } from "$lib/stores/loading";
  import { beforeUpdate } from "svelte";
  import { authSubscribe } from "@junobuild/core";

  // This variable ensures the initialization function runs only once
  let hasInitialized = false;

  // Initialization function
  async function initialize() {
    if (!hasInitialized) {
      // Your one-time initialization code here
      // Search for data in the database, set global variables, etc.
      hasInitialized = true; // Mark as initialized
    }
  }

  beforeUpdate(async () => {
    await initialize();
  });
  onMount(async () => {});
</script>

<Header />
<slot />
