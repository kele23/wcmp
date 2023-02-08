/**
 * <b>Decorator expression</b>
 * Get the current webcomponents context, this means that extract the current "WebComponents" object that initialized the current object
 *
 */
export const context = (value, { kind }) => {
  if (kind !== 'accessor') throw 'Annotation context is only supported in accessor kind';

  return {
    get() {
      return this._wc;
    },
  };
};

/**
 * <b>Decorator expression</b>
 * Method launched when the object is constructed but before object initialization
 *
 */
export const beforeInit = (value, { kind, addInitializer }) => {
  if (kind !== 'method') throw 'Annotation init is only supported in method kind';

  addInitializer(function () {
    value.call(this);
  });
};

/**
 * <b>Decorator expression</b>
 * Method launched when the decorated method after the object is completly initialized and references are resolved
 *
 */
export const afterInit = (value, { kind, addInitializer }) => {
  if (kind !== 'method') throw 'Annotation postConstruct is only supported in method kind';

  addInitializer(function () {
    if (this._wcInit) this._wcInit.push(value);
    this._wcInit = [value];
  });
};
