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

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
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
