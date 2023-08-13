import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.9e15d018.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/index.0fac9f6a.js","_app/immutable/chunks/ProgressBar.svelte_svelte_type_style_lang.10fefdfb.js","_app/immutable/chunks/index.729331e9.js"];
export const stylesheets = ["_app/immutable/assets/0.a9dd539e.css","_app/immutable/assets/ProgressBar.4f1e9ba5.css"];
export const fonts = [];
