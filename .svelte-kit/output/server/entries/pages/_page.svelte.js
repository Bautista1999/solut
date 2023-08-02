import { c as create_ssr_component, v as validate_component } from "../../chunks/ssr.js";
import { authSubscribe } from "@junobuild/core";
import "../../chunks/ProgressBar.svelte_svelte_type_style_lang.js";
import { L as LightSwitch } from "../../chunks/LightSwitch.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".light-switch-container.svelte-143go3z{display:flex;justify-content:center}div.svelte-143go3z{margin-block-start:20%;text-align:center;height:44%}.card.svelte-143go3z{position:absolute;left:50%;transform:translate(-50%, -50%);border-radius:25px}.centered-image.svelte-143go3z{display:block;margin-left:auto;margin-right:auto;width:30%}.centered-flexbox.svelte-143go3z{display:flex;justify-content:center;align-items:center}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  authSubscribe((user) => {
    console.log("User:", user);
  });
  $$result.css.add(css);
  return `${`${`<div class="card p-4 svelte-143go3z" style="width: 30%; align:center"><img src="src/assets/LogoSol3.png" alt="" style="width:30%;" class="centered-image svelte-143go3z"> <br> <h1 data-svelte-h="svelte-12tgxne">Welcome to Solutio</h1> <p data-svelte-h="svelte-1twipxr">Visit <a href="https://kit.svelte.dev">solutio.com</a> to learn about
            us</p> <br> <button type="button" class="btn variant-filled" style="border-radius: 1000px; background-color:orangered" data-svelte-h="svelte-1k2qvtc"><span>🚀</span> <span>Sign In</span></button> <div class="light-switch-container svelte-143go3z">${validate_component(LightSwitch, "LightSwitch").$$render($$result, {}, {}, {})}</div></div>`}`}`;
});
export {
  Page as default
};
