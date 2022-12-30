import ComponentRegister from './services/component-register';
import StoreManager from './services/store-manager';
import { getRefs } from './utils/decorator-utils';
import { Register } from './utils/register';

export default class WebComponents {
  #register = new Register();

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.componentRegisterName = this.registerService(ComponentRegister);
    this.storeManagerName = this.registerService(StoreManager);
  }

  /**
   * @returns The root HTMLElement associated to this WebComponents
   */
  getRootElement() {
    return this.rootElement;
  }

  /**
   * Register a service into WebComponent
   * @param {service} serviceClazz
   */
  registerService(serviceClazz) {
    this.#register.add(
      serviceClazz._wcName,
      'service',
      async () => {
        return serviceClazz;
      },
      serviceClazz._wcProperties
    );

    return serviceClazz._wcName;
  }

  /**
   * Register a component into the the WebComponents
   * @param {component} cmpClazz
   */
  registerComponent(cmpClazz) {
    this.#register.add(
      cmpClazz._wcName,
      'component',
      async () => {
        return cmpClazz;
      },
      cmpClazz._wcProperties
    );

    return cmpClazz._wcName;
  }

  /**
   * Register a dynamic component into the WebComponents.
   * Dynamic components are simply components that will be loaded dynamically using a loader function when are requested
   * Due to the dynamic nature the properties, name in primis, need to provided before the loading of the component
   *
   * example:
   * webComponents.registerDynamicComponent('text', async () => {
   *     return (await import('./src/components/text')).default;
   * });
   * @param {*} name
   * @param {*} loader
   * @param {*} properties
   */
  registerDynamicComponent(name, loader, properties = {}) {
    this.#register.add(name, 'component', loader, properties);
    return name;
  }

  /**
   * Register a dynamic service into the WebComponents.
   * Dynamic service are simply services that will be loaded dynamically using a loader function when are requested
   * Due to the dynamic nature the properties, name in primis, need to provided before the loading of the component
   *
   * @param {*} name
   * @param {*} loader
   * @param {*} properties
   */
  registerDynamicService(name, loader, properties = {}) {
    this.#register.add(name, 'service', loader, properties);
    return name;
  }

  /**
   * Return the component loader function
   * @param {*} name The component name
   * @returns The loader function
   */
  getComponentLoader(name) {
    return this.#register.get(name, 'component');
  }

  /**
   * Return the service loader function
   * @param {*} name The service name
   * @returns The loader function
   */
  getServiceLoader(name) {
    return this.#register.get(name, 'service');
  }

  /**
   * Get a service
   * @param {*} name
   * @returns
   */
  async getService(name) {
    let obj = this.#register.get(name, 'instance');
    if (obj != null) return obj;

    const clazz = await this.#register.get(name, 'service')();
    if (!clazz) return null;

    obj = new clazz(this);
    await this.#init(obj);
    this.#register.add(name, 'instance', obj, {}); // cache service for later uses
    return obj;
  }

  /**
   * Get a component from component name and htmlElement, use this method only if you want to create an object directly.
   * It is preferable to use the component-register to get the object for a HTMLElement
   *
   * @param {string} name
   * @param {HTMLElement} htmlElement
   * @returns
   */
  async getComponent(name, htmlElement) {
    const clazz = await this.#register.get(name, 'component')();
    if (!clazz) return null;

    let obj = new clazz(this, htmlElement);
    await this.#init(obj, true);
    return obj;
  }

  /**
   * Initialize the component or service, this will resolve all services and listeners and then add it to the component
   * @param {*} obj
   */
  async #init(obj, cmp = false) {
    //resolve services
    if (obj._wcToResolve) {
      obj._wcResolved = {};
      for (const name of obj._wcToResolve) {
        obj._wcResolved[name] = await this.getService(name);
      }
    }

    if (cmp) {
      await this.#initCmp(obj);
    }

    //add dispose method
    const _self = this;
    obj._wcDispose = function () {
      _self.#dispose(this, cmp);
    };

    if (obj._wcInit) obj._wcInit();
  }

  async #initCmp(obj) {
    //add listeners
    if (obj._wcListeners) {
      for (const properties of obj._wcListeners) {
        const refs = getRefs(obj._wcRootElement, properties.ref, true);
        for (const ref of refs) {
          ref.addEventListener(properties.event, properties.method, properties.options);
        }
      }
    }

    //add store listeners
    const storeManager = await this.getService(this.storeManagerName);
    if (obj._wcStoreListeners) {
      for (const properties of obj._wcStoreListeners) {
        storeManager.addListener(properties.match, properties.method);
      }
    }

    //add refs
    if (obj._wcRef) {
      obj._wcRefResolved = {};
      for (const ref of obj._wcRef) {
        obj._wcRefResolved[ref.name] = getRefs(obj._wcRootElement, ref.name, ref.all);
      }
    }

    //add sub components
    const componentRegister = await this.getService(this.componentRegisterName);
    if (obj._wcSub) {
      obj._wcSubResolved = {};
      for (const sub of obj._wcSub) {
        const refs = getRefs(obj._wcRootElement, sub.name, sub.all);
        if (!sub.all) {
          obj._wcSubResolved[sub.name] = await componentRegister.getComponent(refs);
        } else {
          obj._wcSubResolved[sub.name] = [];
          for (const ref of refs) {
            obj._wcSubResolved[sub.name].push(await componentRegister.getComponent(ref));
          }
        }
      }
    }
  }

  /**
   * Dispose the service or component
   * @param {*} obj
   */
  async #dispose(obj, cmp = false) {
    if (cmp) await this.#disposeCmp(obj);
    if (obj._wcCustomDispose) obj._wcCustomDispose();
  }

  /**
   * Dispose the component
   * @param {*} obj
   */
  async #disposeCmp(obj) {
    // remove all listeners
    if (obj._wcListeners) {
      for (const properties of obj._wcListeners) {
        const refs = getRefs(obj._wcRootElement, properties.ref, true);
        for (const ref of refs) {
          ref.removeEventListener(properties.event, properties.method, properties.options);
        }
      }
    }

    //remove all store listeners
    const storeManager = await this.getService(this.storeManagerName);
    if (obj._wcStoreListeners) {
      for (const properties of obj._wcStoreListeners) {
        storeManager.removeListener(properties.match, properties.method);
      }
    }
  }

  /**
   * Starts WebComponents!!!!
   */
  start() {
    this.#register
      .list()
      .filter((obj) => obj.type == 'service')
      .filter((obj) => obj.immediate == true)
      .forEach(async (obj) => {
        await this.getService(obj.name);
      });

    this.#showBootstrapMessage();
  }

  #showBootstrapMessage() {
    let msg = '%c WEB Components started!!!✌';
    let styles = [
      'font-size: 12px',
      'font-family: monospace',
      'background: white',
      'display: inline-block',
      'color: black',
      'padding: 8px 19px',
      'border: 1px dashed;',
    ].join(';');
    console.log(msg, styles);
  }
}
