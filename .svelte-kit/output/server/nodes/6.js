import * as universal from '../entries/pages/idea/_id_/_page.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/idea/_id_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/idea/[id]/+page.js";
export const imports = ["_app/immutable/nodes/6.5641e15b.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/index.0fac9f6a.js","_app/immutable/chunks/header.28d50e7e.js","_app/immutable/chunks/ProgressBar.svelte_svelte_type_style_lang.10fefdfb.js","_app/immutable/chunks/index.729331e9.js","_app/immutable/chunks/LightSwitch.f3c13e7a.js","_app/immutable/chunks/stores.d542f0ce.js","_app/immutable/chunks/singletons.d14e209c.js","_app/immutable/chunks/index.8fc90265.js","_app/immutable/chunks/preload-helper.cf010ec4.js"];
export const stylesheets = ["_app/immutable/assets/6.f5c1878f.css","_app/immutable/assets/ProgressBar.4f1e9ba5.css"];
export const fonts = [];
