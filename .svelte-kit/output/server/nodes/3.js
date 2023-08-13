

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/about/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.f52e67f1.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/index.0fac9f6a.js","_app/immutable/chunks/header.6f43d768.js","_app/immutable/chunks/ProgressBar.svelte_svelte_type_style_lang.10fefdfb.js","_app/immutable/chunks/index.729331e9.js","_app/immutable/chunks/LightSwitch.f3c13e7a.js","_app/immutable/chunks/stores.39e87000.js","_app/immutable/chunks/singletons.023c6de5.js"];
export const stylesheets = ["_app/immutable/assets/ProgressBar.4f1e9ba5.css"];
export const fonts = [];
