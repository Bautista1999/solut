import { c as create_ssr_component, v as validate_component } from "../../../../chunks/ssr.js";
import { H as Header } from "../../../../chunks/header.js";
import "@junobuild/core";
const modal_svelte_svelte_type_style_lang = "";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".snap-start.svelte-1t3bsqh{border-radius:20px;width:80%}.text-body.svelte-1t3bsqh{margin-bottom:2%;width:100%}.body.svelte-1t3bsqh{display:flex;justify-content:center;align-items:flex-start;width:100%;min-height:100vh}.content.svelte-1t3bsqh{width:80%;max-width:800px;text-align:left;height:12cm;margin:20px auto 0 auto}.image.svelte-1t3bsqh{width:100%;padding-bottom:56.25%;background-size:contain;background-repeat:no-repeat;background-position:center center}@media(max-width: 768px){.content.svelte-1t3bsqh{width:95%}.image.svelte-1t3bsqh{width:100%}}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(Header, "Header").$$render($$result, {}, {}, {})} ${`<div class="body svelte-1t3bsqh" style="display:flex; justify-content:center;height:fit-content;" data-svelte-h="svelte-1ahsu0m"><div class="snap-start card svelte-1t3bsqh" style="padding: 1%; width: 60%"><div class="snap-start placeholder animate-pulse svelte-1t3bsqh" style="margin-left: 5%; margin-top: 5%; width: 20%; height: 2em"></div> <div class="snap-start placeholder animate-pulse svelte-1t3bsqh" style="margin-left: 5%;margin-right: 5%; margin-top: 5%"></div> <div class="snap-start placeholder animate-pulse svelte-1t3bsqh" style="margin-left: 5%;margin-right: 5%; margin-top: 5%"></div> <div class="snap-start placeholder animate-pulse svelte-1t3bsqh" style="margin-left: 5%;margin-right: 5%; margin-top: 5%; width:30%;"></div> <br> <div class="placeholder animate-pulse" style="margin: 5%; width: 37em; height: 15em;"></div></div></div>`}`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
