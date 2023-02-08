import { getName } from '../utils/decorator-utils';
import { beforeInit } from './common';

/**
 * <b>Decorator function</b>
 * Define that current class is a service.
 * A service is initialized once and can be used by other services and components
 *
 * name:
 * if defined the name is taken by the provided properties, if not defined the name is loaded by the class name and converted to dash-case
 *
 * immediate:
 * specifies that at the starts of WebComponents system the service need to be initialized as soon as possibile.
 * if not defined or false, the service will be initialized at the first reference
 *
 * @param {{name, immediate, tags, options}} properties
 */
export const service = (properties) => {
  return (value, { kind, name }) => {
    if (kind !== 'class') throw 'Annotation service is only supported in class kind';

    const clazz = class extends value {
      constructor(wc) {
        super();
        this._wc = wc;
      }

      @beforeInit
      async _wcInternalInit() {
        for (const init of this._wcInit) init();
      }
    };

    // add function properties
    clazz._wcName = getName(properties?.name, name);
    clazz._wcType = 'service';
    clazz._wcOptions = {
      immediate: properties?.immediate,
      tags: properties?.tags,
      ...properties?.options,
    };
    return clazz;
  };
};

/**
 * <b>Decorator function</b>
 * Load the service identified by the provided name into the target object.
 * Services will be resolved immediatly after the component creation but before the postConstruct call
 *
 * Given the dynamism of the services it is possible that some services will not be resolved this doesn't block the costruction of the component/service that is using this reference
 *
 * @param {{name, tag}} options
 */
export const reference = (options) => {
  return (value, { kind, name, addInitializer }) => {
    if (kind !== 'accessor') throw 'Annotation reference is only supported in accessor kind';

    const customName = options?.name;
    const tag = options?.tag;

    if (!tag) {
      // single reference mode
      const finalName = getName(customName, name);
      addInitializer(function () {
        if (!this._wcToResolve) this._wcToResolve = [];
        this._wcToResolve.push(finalName);
      });
      return {
        get() {
          if (!this._wc) throw 'Annotation reference can be used only in components or services';
          return this._wcResolved[finalName];
        },
      };
    } else {
      // multiple reference mode
      addInitializer(function () {
        if (!this._wcToResolveTags) this._wcToResolveTags = [];
        this._wcToResolveTags.push(tag);
      });
      return {
        get() {
          if (!this._wc) throw 'Annotation reference can be used only in components or services';
          return this._wcResolvedTags[tag];
        },
      };
    }
  };
};
