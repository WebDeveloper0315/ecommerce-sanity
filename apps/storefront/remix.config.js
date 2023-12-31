const isProduction = process.env.NODE_ENV === "production";

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  ignoredRouteFiles: ["**/.*"],
  watchPaths: ["./public", "../../packages/sanity/src"],
  server: isProduction ? "./server.vercel.ts" : "./server.ts",
  /**
   * The following settings are required to deploy Hydrogen apps to Oxygen:
   */
  publicPath: (process.env.HYDROGEN_ASSET_BASE_URL ?? "/") + "build/",
  assetsBuildDirectory: "dist/client/build",
  serverBuildPath: "dist/worker/index.js",
  serverMainFields: ["browser", "module", "main"],
  serverConditions: ["worker", process.env.NODE_ENV],
  serverDependenciesToBundle: "all",
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  serverMinify: isProduction,
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    unstable_tailwind: true,
    unstable_postcss: true,
  },
};
