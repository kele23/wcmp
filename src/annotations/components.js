import { getName } from '../utils/decorator-utils';

/**
 * <b>Decorator function</b>
 * Define that current class is a component.
 * A component is initialized by component-register and attached to an HTMLElement, the life of this component is therefore associated with the life of the HTMLElement
 *
 * name:
 * if defined the name is taken by the provided properties, if not defined the name is loaded by the class name and converted to dash-case
 *
 * @param {{name}} properties
 */
export const component = (properties) => {
  return (value, { kind, name }) => {
    if (kind !== 'class') throw 'Annotation component is only supported in class kind';

    const finalName = getName(properties?.name, name);
    return class extends value {
      constructor(wc, rootElement) {
        super();
        this._wc = wc;
        this._wcRootElement = rootElement;
      }

      static _wcName = finalName;
      static _wcComponent = true;
      static _wcProperties = properties;
    };
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
        if (!this._wc || !this._wcRootElement) throw 'Annotation ref can be used only in components';
        return this._wcRefResolved[finalName];
      },
    };
  };
};

/**
 * <b>Decorator expression</b>
 * Get the component root HTMLElement at the component is attached to
 *
 */
export const root = (value, { kind }) => {
  if (kind !== 'accessor') throw 'Annotation root is only supported in accessor kind';

  return {
    get() {
      if (!this._wc || !this._wcRootElement) throw 'Annotation root can be used only in components';
      return this._wcRootElement;
    },
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
      const method = (...args) => {
        value.call(this, ...args);
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

/**
 * <b>Decorator function</b>
 * Get a sub component searching by name using "data-ref" attribute as key
 *
 * name:
 * if defined the name is taken by the custom name, if not defined the name is loaded by the property name and converted to dash-case
 *
 * @param {string} customName
 */
export const sub = (customName, all = false) => {
  return (value, { kind, name, addInitializer }) => {
    if (kind !== 'accessor') throw 'Annotation sub is only supported in accessor kind';

    const finalName = getName(customName, name);
    addInitializer(function () {
      if (!this._wcSub) this._wcSub = [];
      this._wcSub.push({ name: finalName, all });
    });

    return {
      get() {
        if (!this._wc || !this._wcRootElement) throw 'Annotation sub can be used only in components';
        return this._wcSubResolved[finalName];
      },
    };
  };
};
