export const prerender = true;
export const ssr = false;

// ⚠️ For production build the polyfill needs to be injected with Rollup (see vite.config.ts) because the page might be loaded before the _layout.js which will contains this polyfill
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;