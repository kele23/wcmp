/**
 * Check if item is an object
 * @param {*} item
 * @returns
 */
export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Merge deep into target the sources
 * @param {*} target
 * @param  {...any} sources
 * @returns
 */
export const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key])
          Object.assign(target, {
            [key]: {},
          });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key],
        });
      }
    }
  }

  return mergeDeep(target, ...sources);
};

/**
 * Merge deep into target the source at provided path
 * @param {*} target
 * @param {*} source
 * @param {*} path
 * @returns
 */
export const mergeDeepToPath = (target, source, path) => {
  var paths = path.split('/').slice(1);
  let deepObj = createObjToPath(source, paths);
  const obj = mergeDeep(target, deepObj);
  return obj;
};

/**
 * Set deep into target the source at provided path ( override all contents at path )
 * @param {*} target
 * @param {*} source
 * @param {*} path
 * @returns
 */
export const setDeepToPath = (target, source, path) => {
  let parts = path.split('/').slice(1);
  const nObj = target;
  let iObj = target[parts[0]] ? target[parts[0]] : {};
  if (parts.length > 1) {
    nObj[parts[0]] = setDeepToPath(iObj, parts.slice(1).join('/'), source);
  } else {
    nObj[parts[0]] = source;
  }
  return nObj;
};

/**
 * Create an object at provided path ( list of strings )
 * @param {*} target
 * @param {*} paths
 * @returns
 */
export const createObjToPath = (target, paths) => {
  if (!paths || paths.length == 0) return target;

  const obj = {};
  obj[paths[0]] = createObjToPath(target, paths.slice(1));
  return obj;
};

/**
 * Deep get an object from obj at the path
 * @param {*} obj
 * @param {*} path
 * @returns
 */
export const deepGet = (obj, path) => {
  let paths = path.split('/').slice(1);
  let current = obj;

  for (let i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return null;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
};
