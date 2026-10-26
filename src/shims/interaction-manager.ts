const ReactNative = require("react-native");

export const InteractionManagerShim = {
  runAfterInteractions(task?: () => any) {
    let handle: any;
    const promise = new Promise((resolve) => {
      handle = setTimeout(() => {
        resolve(task ? task() : undefined);
      }, 0);
    });
    return {
      then: promise.then.bind(promise),
      done: (...args: any[]) => (promise as any).done?.(...args),
      cancel: () => clearTimeout(handle),
    };
  },
  createInteractionHandle() {
    return 1;
  },
  clearInteractionHandle(_handle?: number) {},
  setDeadline(_deadline?: number) {},
  Events: {
    interactionStarted: "interactionStarted",
    interactionComplete: "interactionComplete",
  },
  addListener: () => ({ remove: () => {} }),
};

try {
  Object.defineProperty(ReactNative, "InteractionManager", {
    configurable: true,
    enumerable: true,
    get() {
      return InteractionManagerShim;
    },
    set() {},
  });
} catch {
  ReactNative.InteractionManager = InteractionManagerShim;
}

if (typeof globalThis !== "undefined") {
  (globalThis as any).InteractionManager = InteractionManagerShim;
}

export default InteractionManagerShim;
