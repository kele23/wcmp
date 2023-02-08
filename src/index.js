import ComponentRegister from './services/component-register';
import StoreManager from './services/store-manager';
import StringTemplateLoader from './services/string-template-loader';
import { getRefs } from './utils/decorator-utils';
import { Register } from './utils/register';

export default class WebComponents {
  #register = new Register();

  constructor(window, options = {}) {
    this.window = window;
    this.rootElement = window.document.body;

    this.options = options;
    this.componentRegisterName = this.register(ComponentRegister);
    this.storeManagerName = this.register(StoreManager);
    this.stringTplName = this.register(StringTemplateLoader);
  }

  /**
   * @returns The root HTMLElement associated to this WebComponents
   */
  getRootElement() {
    return this.rootElement;
  }

  /**
   *
   * @returns
   */
  getWindow() {
    return this.window;
  }

  /**
   * Register a service into WebComponent
   * @param {service} serviceClazz
   */
  register(clazz) {
    this.#register.add(
      clazz._wcName,
      clazz._wcType,
      async () => {
        return this.#extendClass(clazz);
      },
      clazz._wcOptions
    );

    return clazz._wcName;
  }

  /**
   * Register a dynamic component into the WebComponents.
   * Dynamic components are simply components that will be loaded dynamically using a loader function when are requested
   * Due to the dynamic nature the properties, name in primis, need to provided before the loading of the component
   *
   * example:
   * webComponents.registerDynamic('text', async () => {
   *     return (await import('./src/components/text')).default;
   * });
   * @param {*} name
   * @param {*} type one of ['service', 'component']
   * @param {*} loader
   * @param {*} properties
   */
  registerDynamic(name, type, loader, options = {}) {
    this.#register.add(
      name,
      type,
      async () => {
        const clazz = await loader();
        return this.#extendClass(clazz);
      },
      options
    );
    return name;
  }

  /**
   * Add "extra" properties to the class
   */
  #extendClass(clazz) {
    const self = this;
    return class extends clazz {
      constructor() {
        super(self);
      }
    };
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

    obj = new clazz();
    this.#register.add(name, 'instance', obj, {}); // cache service for later uses
    return obj;
  }

  /**
   * Get a list of service using the tags to find it
   * @param {*} tag
   * @returns A list of services tagged with that tag
   */
  async getServiceByTag(tag) {
    const services = this.#register
      .list()
      .filter((obj) => obj.type == 'service')
      .filter((obj) => obj.tags && obj.tags.indexOf(tag) >= 0);

    const finalServices = [];
    for (const service of services) {
      finalServices.push(await this.getService(service.name));
    }
    return finalServices;
  }

  /**
   * @returns The register
   */
  getRegister() {
    return this.#register;
  }

  async #initCmp(obj) {
    const storeManager = await this.getService(this.storeManagerName);

    //add listeners
    if (obj._wcListeners) {
      const evList = [];
      for (const properties of obj._wcListeners) {
        // get list of refs
        const refs = getRefs(obj.getShadowRoot(), properties.ref);
        for (const ref of refs) {
          //create resolved listener
          evList.push({
            element: ref,
            event: properties.event,
            method: (event) => {
              properties.method(event, ref);
            },
            options: properties.options,
          });
        }

        obj._wcResolvedListeners = evList;
      }

      for (const ev of obj._wcResolvedListeners) {
        ev.element.addEventListener(ev.event, ev.method, ev.options);
      }
    }

    //add store listeners
    if (obj._wcStoreListeners) {
      for (const properties of obj._wcStoreListeners) {
        storeManager.addListener(properties.match, properties.method);
      }
    }

    //add refs
    if (obj._wcRef) {
      obj._wcRefResolved = {};
      for (const ref of obj._wcRef) {
        obj._wcRefResolved[ref.name] = getRefs(obj._wcRootElement, ref.name);
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

    if (!this.options.disableConsoleMessage) this.#showConsoleMessage();
  }

  #showConsoleMessage() {
    let msg = '%c WEB Components started!!! https://github.com/kele23/web-components ✌';
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
