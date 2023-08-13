import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { H as Header } from "../../../chunks/header.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})} <h1 data-svelte-h="svelte-ggif4a">Hello</h1>`;
});
export {
  Page as default
};
