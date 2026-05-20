const fs = require("fs");
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = false;
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Force singletons for packages that register native views/modules.
// With pnpm + node-linker=hoisted, these can be reached via two physical
// paths (apps/mobile/node_modules symlink + hoisted root copy), which
// triggers "Tried to register two views with the same name".
// We re-route resolution to act as if the import came from the workspace
// root, so Metro consistently picks the hoisted real package.
const dedupePackages = new Set([
  "react",
  "react-dom",
  "react-native",
  "react-native-safe-area-context",
  "react-native-screens",
  "react-native-gesture-handler",
  "react-native-reanimated",
  "react-native-svg",
  "@react-native-async-storage/async-storage",
]);
const dedupeOrigin = path.join(workspaceRoot, "noop.js");

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (dedupePackages.has(moduleName)) {
    return context.resolveRequest(
      { ...context, originModulePath: dedupeOrigin },
      moduleName,
      platform,
    );
  }
  if (moduleName.startsWith(".") && moduleName.endsWith(".js")) {
    const baseDir = path.dirname(context.originModulePath);
    const candidate = path.resolve(baseDir, moduleName);
    if (!fs.existsSync(candidate)) {
      const tsCandidate = candidate.replace(/\.js$/, ".ts");
      if (fs.existsSync(tsCandidate)) {
        return context.resolveRequest(context, moduleName.replace(/\.js$/, ""), platform);
      }
    }
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
