<script>
  // import "../app.postcss";

  import "./global.styles.css";
  import SideMenu from "$lib/components/SideMenu.svelte";
  import HeaderV2 from "$lib/components/Header_v2.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { initSatellite } from "@junobuild/core-peer";
  import { onMount, onDestroy } from "svelte";
  import { updateNotificationCount } from "$lib/stores/notifications";
  import { CheckIfSignedIn } from "$lib/signin_functions/user_signin_functions";
  import { initOrbiter } from "@junobuild/analytics";

  const init = async () => {
    await initSatellite({ satelliteId: "svftd-daaaa-aaaal-adr3a-cai" });
    await initOrbiter({
      satelliteId: "svftd-daaaa-aaaal-adr3a-cai",
      orbiterId: "vwcao-hiaaa-aaaal-ajlpq-cai",
    });
  };

  function addGlobalEventListeners() {
    const events = ["click", "keypress"];

    const updateNotifications = () => {
      updateNotificationCount();
    };
    const checkIfSignedIn = () => {
      CheckIfSignedIn();
    };

    events.forEach((event) => {
      window.addEventListener(event, updateNotifications);
      window.addEventListener(event, checkIfSignedIn);
    });

    // Cleanup function to remove event listeners
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateNotifications);
        window.removeEventListener(event, checkIfSignedIn);
      });
    };
  }

  onMount(async () => {
    await init();
    await updateNotificationCount();
    await CheckIfSignedIn();
    const removeEventListeners = addGlobalEventListeners();

    // Remove event listeners when component is destroyed
    onDestroy(() => {
      removeEventListeners();
    });

    // Initial notification count update
  });
</script>

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>
<div class="container">
  <div class="Sidebar"><SideMenu /></div>
  <div class="Header">
    <!-- <HeaderV2 /> -->
  </div>
  <div class="Body-content">
    {#await init()}
      <!-- TODO: a loading component. That said loading Juno module is fast -->
    {:then _}
      <slot />
    {/await}
  </div>
  <div class="Footer"><Footer /></div>
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
  }

  .Header {
    grid-area: Header;
  }

  .Body-content {
    grid-area: Body-content;
    padding-top: 0px; /* Padding at the top */
    padding-left: 75px; /* Padding to the left */
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

  @media (max-width: 480px) {
    .Body-content {
      padding-top: 0px; /* Padding at the top */
      padding-left: 0px; /* Padding to the left */
      padding-bottom: 0px; /* Adjust as needed */
      margin-left: 10px;
      margin-right: 10px;
    }

    .Footer {
      padding: 0px; /* Padding to the left */
      visibility: hidden;
    }
    .container {
      display: grid;
      grid-template-columns: 0fr 1fr; /* Sidebar takes up the width it needs, content takes up the rest */
      grid-template-rows: auto auto auto; /* Header, content, footer */
      grid-template-areas:
        "Sidebar Body-content"
        "Sidebar Body-content"
        "Sidebar Footer";
    }
    .Header {
      visibility: hidden;
    }
  }
</style>
