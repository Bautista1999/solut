import * as universal from '../entries/pages/idea/_page.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/idea/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/idea/+page.js";
export const imports = ["_app/immutable/nodes/6.9ca84fd8.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/index.0fac9f6a.js","_app/immutable/chunks/header.6f43d768.js","_app/immutable/chunks/ProgressBar.svelte_svelte_type_style_lang.10fefdfb.js","_app/immutable/chunks/index.729331e9.js","_app/immutable/chunks/LightSwitch.f3c13e7a.js","_app/immutable/chunks/stores.39e87000.js","_app/immutable/chunks/singletons.023c6de5.js","_app/immutable/chunks/index.8fc90265.js","_app/immutable/chunks/preload-helper.cf010ec4.js"];
export const stylesheets = ["_app/immutable/assets/6.f5c1878f.css","_app/immutable/assets/ProgressBar.4f1e9ba5.css"];
export const fonts = [];
