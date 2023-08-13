

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.8b0419fa.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/index.0fac9f6a.js","_app/immutable/chunks/index.8fc90265.js","_app/immutable/chunks/preload-helper.cf010ec4.js","_app/immutable/chunks/ProgressBar.svelte_svelte_type_style_lang.10fefdfb.js","_app/immutable/chunks/index.729331e9.js","_app/immutable/chunks/ProgressRadial.9f2428b8.js","_app/immutable/chunks/LightSwitch.f3c13e7a.js","_app/immutable/chunks/navigation.ab367922.js","_app/immutable/chunks/singletons.023c6de5.js"];
export const stylesheets = ["_app/immutable/assets/2.e77b9074.css","_app/immutable/assets/ProgressBar.4f1e9ba5.css"];
export const fonts = [];
