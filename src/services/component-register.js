import { afterInit, context } from '../annotations/common';
import { service } from '../annotations/services';

/**
 * Component Register service
 * This service handle the association beetween components and HTMLElement and listen into html changes to make sure that all components will be initialized
 */
@service({
  immediate: true,
})
class ComponentRegister {
  @context accessor #wc = null;

  @afterInit
  init() {
    this.applyOnDocument();
  }

  /**
   * Search for all not defined elements into the document element and define the element
   */
  async applyOnDocument() {
    const observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; ++i) {
        for (let j = 0; j < mutations[i].addedNodes.length; ++j) {
          this._apply(mutations[i].addedNodes[j]);
        }
      }
    });
    observer.observe(this.#wc.getRootElement(), {
      childList: true,
      subtree: true,
    });

    await this._apply(this.#wc.getRootElement());
  }

  /**
   * Apply the logic
   * @param {*} el
   * @returns
   */
  async _apply(el) {
    if (!el.querySelectorAll) return;

    // load to define
    const toDefine = [];
    const components = this.#wc
      .getRegister()
      .list()
      .filter((obj) => obj.type == 'component');

    for (const component of components) {
      let ok = false;
      ok = ok || el.matches(component.name);
      ok = ok || el.querySelector(component.name);
      ok = ok || el.matches(`[is=${component.name}]`);
      ok = ok || el.querySelector(`[is=${component.name}]`);
      if (ok) toDefine.push(component);
    }

    // define all as custom elements
    const window = this.#wc.getWindow();
    for (const toDef of toDefine) {
      // load the module
      const clazz = await toDef.value();
      // define
      window.customElements.define(toDef.name, clazz);
    }
  }
}

export default ComponentRegister;
