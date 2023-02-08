import { afterInit, context } from '../annotations/common';
import { service } from '../annotations/services';

@service({
  immediate: true,
})
class StoreManager {
  @context accessor #wc = null;

  constructor() {
    this.stores = {};
    this.cbs = {};
  }

  @afterInit
  init() {
    this.rootEl = this.#wc.getRootElement();
  }

  addListener(match, cb) {
    const regex = match instanceof RegExp ? match : new RegExp('^' + match + '.*$');
    const fFn = (event) => {
      const pathChanged = event.detail.path;
      if (regex.test(pathChanged)) {
        cb(pathChanged, event.detail.newData, event.detail.oldData);
      }
    };

    this.rootEl.addEventListener('wcStoreChange', fFn);
    this.cbs[cb] = fFn;
  }

  removeListener(match, cb) {
    const fFn = this.cbs[cb];
    this.rootEl.removeEventListener('wcStoreChange', fFn);
  }

  emitToggle(path) {
    const oldValue = this._recLookup(this.stores, path);
    let newValue = true;
    if (typeof newValue == 'boolean') {
      newValue = !oldValue;
    }

    this.emit(path, newValue);
  }

  emit(path, data, merge = false) {
    const oldData = this._recLookup(this.stores, path) || {};
    let newData = data;
    if (merge && typeof data == 'object' && typeof oldData == 'object') {
      newData = { ...oldData, ...data };
    }

    //set store
    this.stores = this._recSetup(this.stores, path, newData);

    //send event
    let event = new CustomEvent('wcStoreChange', {
      detail: {
        path,
        oldData,
        newData,
      },
    });
    this.rootEl.dispatchEvent(event);
    console.debug(`Changed store "${path}" to`, newData);
  }

  get(path) {
    return this._recLookup(this.stores, path);
  }

  _recLookup(obj, path) {
    if (!obj) return null;
    const parts = path.split('/');
    if (parts.length == 1) {
      return obj[parts[0]];
    }
    return this._recLookup(obj[parts[0]], parts.slice(1).join('/'));
  }

  _recSetup(obj, path, data) {
    const nObj = obj;
    const parts = path.split('/');
    let iObj = obj[parts[0]] ? obj[parts[0]] : {};
    if (parts.length > 1) {
      nObj[parts[0]] = this._recSetup(iObj, parts.slice(1).join('/'), data);
    } else {
      nObj[parts[0]] = data;
    }
    return nObj;
  }
}

export default StoreManager;
