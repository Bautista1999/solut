<script>
    import { TabGroup, Tab, TabAnchor } from "@skeletonlabs/skeleton";
    import { page } from "$app/stores";
    import { LightSwitch } from "@skeletonlabs/skeleton";
</script>

<TabGroup class="text-2xl px-10 py-5">
    <TabAnchor href="/homepage" selected={$page.url.pathname === "/homepage"}
        >Home</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >About</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >Profile</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >Feed</TabAnchor
    >
    <TabAnchor href="/wallet" selected={$page.url.pathname === "/wallet"}
        >Wallet</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >Contact</TabAnchor
    >
    <TabAnchor href="/about" selected={$page.url.pathname === "/about"}
        >Notifications</TabAnchor
    >
    <TabAnchor href="/create" selected={$page.url.pathname === "/create"}>
        <div><button> Create</button></div>
    </TabAnchor>
    <TabAnchor>
        <LightSwitch />
    </TabAnchor>
</TabGroup>

<style>
</style>
