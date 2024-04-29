<script>
    import { onMount } from "svelte";
    import { signIn, signOut } from "@junobuild/core";

    import { goto } from "$app/navigation";

    import Loading from "$lib/components/loading.svelte";

    import { basicInfo, info } from "../lib/stores/auth.state";
    import { registerUser } from "$lib/data_functions/user.functions";
    import { loginedIn } from "$lib/stores/other_stores";
</script>

<style>
</style>
