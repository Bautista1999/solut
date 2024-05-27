<script>
  // import "../app.postcss";

  import "./global.styles.css";
  import { onMount } from "svelte";
  import { basicInfo, info, initDB } from "$lib/stores/auth.state";
  import { beforeUpdate } from "svelte";
  import { authSubscribe } from "@junobuild/core-peer";
  import SideMenu from "$lib/components/SideMenu.svelte";
  import HeaderV2 from "$lib/components/Header_v2.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { initSatellite } from "@junobuild/core";

  // This variable ensures the initialization function runs only once
  // let hasInitialized = false;

  // // Initialization function
  // async function initialize() {
  //   if (!hasInitialized) {
  //     // Your one-time initialization code here
  //     // Search for data in the database, set global variables, etc.
  //     hasInitialized = true; // Mark as initialized
  //   }
  // }

  // beforeUpdate(async () => {
  //   await initialize();
  // });

  onMount(async () => {
    await initSatellite({ satelliteId: "svftd-daaaa-aaaal-adr3a-cai" });
  });
</script>

<div class="body">
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
  />
  <div class="container">
    <div class="Sidebar"><SideMenu /></div>
    <div class="Header"><HeaderV2 /></div>
    <div class="Body-content">
      <slot />
    </div>
    <div class="Footer"><Footer /></div>
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: auto 1fr; /* Sidebar takes up the width it needs, content takes up the rest */
    grid-template-rows: auto auto auto; /* Header, content, footer */
    grid-template-areas:
      "Sidebar Header"
      "Sidebar Body-content"
      "Sidebar Footer";
    min-height: 100vh; /* Fill the height of the viewport at minimum */
  }

  .Header {
    grid-area: Header;
  }

  .Body-content {
    grid-area: Body-content;
    padding-top: 50px; /* Padding at the top */
    padding-left: 75px; /* Padding to the left */
    padding-bottom: 30px; /* Adjust as needed */
    min-height: 100vh;

    /* Removed flex: 1 as it's not necessary with grid and can be removed */
  }

  .Sidebar {
    grid-area: Sidebar;
  }

  .Footer {
    grid-area: Footer;
    padding-left: 75px; /* Padding to the left */
  }
</style>
