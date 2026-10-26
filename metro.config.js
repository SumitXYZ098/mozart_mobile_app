const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);
config.transformer.assetRegistryPath = "@react-native/assets-registry/registry";

config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.sourceExts.push("svg");

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react-native/asset-registry" ||
    moduleName === "react-native/Libraries/Image/AssetRegistry"
  ) {
    return {
      filePath: require.resolve("@react-native/assets-registry/registry"),
      type: "sourceFile",
    };
  }
  if (moduleName === "react-native/unstable-internals-do-not-use") {
    return {
      filePath: require.resolve("./src/shims/unstable-internals.js"),
      type: "sourceFile",
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });

