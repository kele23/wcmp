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
 * Starts the decorated method after the object is completly initialized and references are resolved
 *
 */
export const postConstruct = (value, { kind, addInitializer }) => {
  if (kind !== 'method') throw 'Annotation postConstruct is only supported in method kind';

  addInitializer(function () {
    this._wcInit = value;
  });
};

/**
 * <b>Decorator expression</b>
 * Starts the decorated method before the object will be disposed, need to be used in case there are custom listener attached to some elements
 *
 */
export const dispose = (value, { kind, addInitializer }) => {
  if (kind !== 'method') throw 'Annotation disposed is only supported in method kind';

  addInitializer(function () {
    this._wcCustomDispose = value;
  });
};
