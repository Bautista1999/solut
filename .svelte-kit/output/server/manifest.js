export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.dc8018a4.js","app":"_app/immutable/entry/app.0ae5b132.js","imports":["_app/immutable/entry/start.dc8018a4.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/singletons.023c6de5.js","_app/immutable/chunks/index.729331e9.js","_app/immutable/entry/app.0ae5b132.js","_app/immutable/chunks/preload-helper.cf010ec4.js","_app/immutable/chunks/scheduler.604afa58.js","_app/immutable/chunks/index.0fac9f6a.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
