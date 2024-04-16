<script>
  // Finally, your application's global stylesheet (sometimes labeled 'app.css')
  import "../app.postcss";

  import { onMount } from "svelte";
  import { basicInfo, info, initDB } from "$lib/stores/auth.state";
  import Header from "$lib/components/header.svelte";
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

<div class="body">
  <Header />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
  />

  <slot />
</div>

<style>
</style>
