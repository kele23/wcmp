import { getName } from '../utils/decorator-utils';
import { beforeInit } from './common';

/**
 * <b>Decorator function</b>
 * Define that current class is a component.
 * A component is initialized by component-register and attached to an HTMLElement, the life of this component is therefore associated with the life of the HTMLElement
 *
 * name:
 * if defined the name is taken by the provided properties, if not defined the name is loaded by the class name and converted to dash-case
 *
 * @param {{name, template, templateLoader, options}} properties
 */
export const component = (properties) => {
  return (value, { kind, name }) => {
    if (kind !== 'class') throw 'Annotation component is only supported in class kind';

    // callable function
    const clazz = class extends value {
      constructor(wc) {
        super();
        this._wc = wc;
      }

      @beforeInit
      async _wcInternalInit() {
        for (const init of this._wcInit) init.call(this);
      }
    };

    // add function properties
    clazz._wcName = getName(properties?.name, name);
    clazz._wcType = 'component';
    clazz._wcOptions = properties?.options;
    return clazz;
  };
};

/**
 * <b>Decorator function</b>
 * Get a sub html element searching by name using "data-ref" attribute as key
 *
 * name:
 * if defined the name is taken by the custom name, if not defined the name is loaded by the property name and converted to dash-case
 *
 * @param {string} customName
 */
export const ref = (customName, all = false) => {
  return (value, { kind, name, addInitializer }) => {
    if (kind !== 'accessor') throw 'Annotation ref is only supported in accessor kind';

    const finalName = getName(customName, name);
    addInitializer(function () {
      if (!this._wcRef) this._wcRef = [];
      this._wcRef.push({ name: finalName, all });
    });

    return {
      get() {
        const resolvedRefs = this._wcRefResolved[finalName];
        return all ? resolvedRefs : resolvedRefs[0];
      },
    };
  };
};

/**
 * <b>Decorator function</b>
 * Adds an eventListener with
 *
 */
export const listener = ({ ref = 'root', event = 'click', options = {} }) => {
  return (value, { kind, addInitializer }) => {
    if (kind !== 'method') throw 'Annotation listener is only supported in method kind';

    addInitializer(function () {
      const method = (ev, element, sub) => {
        value.call(this, ev, element, sub);
      };

      if (!this._wcListeners) this._wcListeners = [];
      this._wcListeners.push({
        ref,
        event,
        options,
        method,
      });
    });
  };
};

/**
 * <b>Decorator function</b>
 * Adds an eventListener with
 *
 */
export const storeListener = ({ match }) => {
  return (value, { kind, addInitializer }) => {
    if (kind !== 'method') throw 'Annotation storeListener is only supported in method kind';

    addInitializer(function () {
      const method = (...args) => {
        value.call(this, ...args);
      };

      if (!this._wcStoreListeners) this._wcStoreListeners = [];
      this._wcStoreListeners.push({
        match,
        method,
      });
    });
  };
};
