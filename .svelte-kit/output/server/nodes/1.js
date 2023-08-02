

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.455d00f2.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/index.0fac9f6a.js","_app/immutable/chunks/stores.d542f0ce.js","_app/immutable/chunks/singletons.d14e209c.js","_app/immutable/chunks/index.729331e9.js"];
export const stylesheets = [];
export const fonts = [];
