

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.117f8b85.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/index.0fac9f6a.js","_app/immutable/chunks/stores.39e87000.js","_app/immutable/chunks/singletons.023c6de5.js","_app/immutable/chunks/index.729331e9.js"];
export const stylesheets = [];
export const fonts = [];
