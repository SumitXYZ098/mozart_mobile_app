let AssetSourceResolver;
try {
  const m = require('react-native/Libraries/Image/AssetSourceResolver');
  AssetSourceResolver = m && m.default ? m.default : m;
} catch {}

let NativeRedBox;
try {
  const m = require('react-native/Libraries/NativeModules/specs/NativeRedBox');
  NativeRedBox = m && m.default ? m.default : m;
} catch {}

let NativeSourceCode;
try {
  const m = require('react-native/Libraries/NativeModules/specs/NativeSourceCode');
  NativeSourceCode = m && m.default ? m.default : m;
} catch {}

let DevLoadingView;
try {
  const m = require('react-native/Libraries/Utilities/DevLoadingView');
  DevLoadingView = m && m.default ? m.default : m;
} catch {}

if (!DevLoadingView) {
  DevLoadingView = {
    showMessage: () => {},
    hide: () => {},
  };
}

let NativeExceptionsManager;
try {
  const m = require('react-native/Libraries/Core/NativeExceptionsManager');
  NativeExceptionsManager = m && m.default ? m.default : m;
} catch {}

const exported = {
  AssetSourceResolver,
  NativeRedBox,
  NativeSourceCode,
  DevLoadingView,
  NativeExceptionsManager,
};

module.exports = {
  ...exported,
  default: exported,
};
