import { context, postConstruct } from '../annotations/common';
import { service } from '../annotations/services';
import { nanoid } from 'nanoid';

/**
 * Component Register service
 * This service handle the association beetween components and HTMLElement and listen into html changes to make sure that all components will be initialized
 */
@service({
  immediate: true,
})
class ComponentRegister {
  @context accessor #wc = null;

  @postConstruct
  init() {
    this.applyOnDocument(this.#wc.getRootElement());
  }

  /**
   * Search for all registered class into the document element and apply the logic
   */
  async applyOnDocument(rootElement) {
    let rootEl = rootElement;
    const observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; ++i) {
        for (let j = 0; j < mutations[i].addedNodes.length; ++j) {
          this._apply(mutations[i].addedNodes[j]);
        }
      }
    });
    observer.observe(rootEl, {
      childList: true,
      subtree: true,
    });

    await this._apply(rootEl);
  }

  async _apply(el) {
    if (!el.querySelectorAll || !el.hasAttribute) return;

    if (el.hasAttribute('data-component')) {
      const elFirstClass = el.dataset.component || el.classList[0];
      if (elFirstClass && this.#wc.getComponentLoader(elFirstClass)) {
        await this._applyTo(el, elFirstClass, this.#wc.getComponentLoader(elFirstClass));
      }
    }

    const components = Array.from(el.querySelectorAll('[data-component]'));
    for (const component of components) {
      const firstClass = component.dataset.component || component.classList[0];
      if (!firstClass || !this.#wc.getComponentLoader(firstClass)) continue;

      await this._applyTo(component, firstClass, this.#wc.getComponentLoader(firstClass));
    }
  }

  /**
   * Apply to the specific element the necessary logic
   * @param {HTMLELement} el
   * @returns {}
   */
  async applyTo(el) {
    if (el.objReference) return el.objReference;
    if (!el.hasAttribute('data-component')) return null;

    const elFirstClass = el.dataset.component || el.classList[0];
    if (elFirstClass && this.#wc.getComponentLoader(elFirstClass)) {
      return await this._applyTo(el, elFirstClass, this.#wc.getComponentLoader(elFirstClass));
    }
  }

  /**
   * Apply the class to the element
   * @param {HTMLELement} el
   * @param {string} r
   * @param {Function} loader
   * @returns {Component} the component instance
   */
  async _applyTo(el, r, loader) {
    if (el.objReference) return el.objReference;

    //make id
    let id;
    if (el.id) id = el.id;
    else {
      id = r + '-' + nanoid(10);
      el.setAttribute('id', id);
    }

    const refClass = await loader();
    if (!refClass) return;

    try {
      if (el.objReference) return el.objReference;
      el.objReference = await this.#wc.getComponent(r, el);
      console.debug(`Created object ${r} to component with id ${id}`);
      return el.objReference;
    } catch (error) {
      console.warn(`Cannot apply class ${r} to element ${id} and classes ${el.classList}`, error);
    }

    return null;
  }

  /**
   * Get class from element
   * @param {HTMLELement} element
   * @returns {Component} the component instance
   */
  async getComponent(element) {
    return await this.applyTo(element);
  }

  /**
   * Reload components with selector
   */
  async reload(cmp) {
    let classes = cmp;
    let selector = '.' + cmp;
    if (cmp.startsWith('.')) {
      classes = cmp.substring(1);
      selector = cmp;
    }

    const rootEl = document.documentElement;

    let loader = this.#wc.getComponentLoader(classes);
    if (!loader) {
      console.warn('Cannot reload ' + classes + ' - loader not found');
      return;
    }

    //query
    const elements = rootEl.querySelectorAll(selector);
    for (const el of elements) {
      if (el.objReference) {
        await el.objReference._wcDispose();
        console.info(`Disposed object ${classes} to component with id ${el.id}`);
        el.objReference = null;
      }
      return await this._applyTo(el, classes, loader);
    }
  }

  /**
   * Dispose all components inside the element
   * @param {*} el
   */
  dispose(el) {
    const components = Array.from(el.querySelectorAll('[data-component]'));
    for (const component of components) {
      if (component.objReference) {
        component.objReference._wcDispose();
      }
    }

    if (el.hasAttribute('data-component') && el.objReference) {
      el.objReference._wcDispose();
    }
  }
}

export default ComponentRegister;
