<script>
  // import "../app.postcss";

  import "./global.styles.css";
  import SideMenu from "$lib/components/SideMenu.svelte";
  import HeaderV2 from "$lib/components/Header_v2.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { initSatellite } from "@junobuild/core-peer";
  import { onMount, onDestroy } from "svelte";
  import { updateNotificationCount } from "$lib/stores/notifications";

  const init = async () => {
    await initSatellite({ satelliteId: "svftd-daaaa-aaaal-adr3a-cai" });
  };

  function addGlobalEventListeners() {
    const events = ["click", "keypress"];

    const updateNotifications = () => {
      updateNotificationCount();
    };

    events.forEach((event) => {
      window.addEventListener(event, updateNotifications);
    });

    // Cleanup function to remove event listeners
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateNotifications);
      });
    };
  }

  onMount(async () => {
    await init();
    await updateNotificationCount();
    const removeEventListeners = addGlobalEventListeners();

    // Remove event listeners when component is destroyed
    onDestroy(() => {
      removeEventListeners();
    });

    // Initial notification count update
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
      {#await init()}
        <!-- TODO: a loading component. That said loading Juno module is fast -->
      {:then _}
        <slot />
      {/await}
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
