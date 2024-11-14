/**
 * Workaround for https://github.com/Mermade/jgeXml/issues/17.
 *
 * @copyright Copyright 2024 Kevin Locke <kevin@kevinlocke.name>
 * @license MIT
 */

import { debuglog } from 'node:util';

const debug = debuglog('jgexml-issue17-workaround');

// Number of attempts to prevent.
// May need to be adjusted due to multiple includes of different modules (and
// module versions) with the same issue
let preventDefine = 0;
let preventWrite = 1;

// Prevent Object.defineProperty(String.prototype, 'replaceAll', ...)
// as done by jgexml >= 0.4.0
if (preventDefine > 0) {
  const definePropertyDesc =
    Object.getOwnPropertyDescriptor(Object, 'defineProperty');
  const defineProperty = definePropertyDesc.value;

  function definePropertyWorkaround(obj, prop, descriptor) {
    if (obj === String.prototype && prop === 'replaceAll') {
      debug('Ignoring attempt to redefine String.prototype.replaceAll');

      preventDefine -= 1;
      if (preventDefine < 1) {
        debug('Restoring Object.defineProperty to its original value');
        defineProperty(Object, 'defineProperty', definePropertyDesc);
      }

      return obj;
    }

    // Forward calls to the original Object.defineProperty
    return defineProperty.call(Object, obj, prop, descriptor);
  }

  debug('Intercepting Object.defineProperty');
  Object.defineProperty(Object, 'defineProperty', {
    ...definePropertyDesc,
    value: definePropertyWorkaround,
  });
}

// Prevent Object.defineProperty(String.prototype, 'replaceAll', ...)
// as done by jgexml >= 0.4.0
if (preventWrite > 0) {
  const replaceAllDesc =
    Object.getOwnPropertyDescriptor(String.prototype, 'replaceAll');
  const { value: replaceAll, replaceAllDescNoValue } = replaceAllDesc;
  debug('Intercepting String.prototype.replaceAll');
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(String.prototype, 'replaceAll', {
    ...replaceAllDescNoValue,
    get: () => replaceAll,
    set: () => {
      debug('Ignoring attempt to write String.prototype.replaceAll\n');
      preventWrite -= 1;
      if (preventWrite < 1) {
        debug('Restoring String.prototype.replaceAll to its original value');
        // eslint-disable-next-line no-extend-native
        Object.defineProperty(String.prototype, 'replaceAll', replaceAllDesc);
      }
    },
  });
}
