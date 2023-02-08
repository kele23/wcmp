/**
 * Get decorator final name to use
 * @param {*} customName
 * @param {*} name
 * @returns
 */
export const getName = (customName, name) => {
  if (customName) return customName;

  let finalName = name;
  if (finalName.startsWith('#')) finalName = finalName.substr(1);

  finalName = finalName.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  if (finalName.startsWith('-')) finalName = finalName.substr(1);
  return finalName;
};

/**
 *
 * Find the refs using root, name and optional all parameter to get only the first or all the references
 *
 * @param {*} rootElement
 * @param {*} refName
 * @param {*} all
 * @returns
 */
export const getRefs = (rootElement, refName) => {
  let elements = [];
  switch (refName) {
    case 'root':
      elements = [rootElement];
      break;
    case 'window':
      elements = [window];
      break;
    case 'document':
      elements = [document];
      break;
    default:
      elements = Array.from(rootElement.querySelectorAll(`[data-ref=${refName}]`));
      break;
  }

  return elements;
};

/**
 * Resolve the object references
 * @param {*} obj
 * @param {*} wc
 */
export const resolveReferences = async (obj, wc) => {
  //resolve services by name
  if (obj._wcToResolve) {
    obj._wcResolved = {};
    for (const name of obj._wcToResolve) {
      obj._wcResolved[name] = await wc.getService(name);
    }
  }

  //resolve services by tags
  if (obj._wcToResolveTags) {
    obj._wcResolvedTags = {};
    for (const tag of obj._wcToResolveTags) {
      obj._wcResolvedTags[tag] = await wc.getServiceByTag(tag);
    }
  }
};

/**
 * 
 * @param {*} template 
 * @param {*} templateLoader 
 * @param {*} obj 
 * @param {*} wc 
 * @returns 
 */
export const loadTemplate = async (template, templateLoader, obj, wc) => {
  // load template
  if (!template || !templateLoader) return;
  if (!obj.shadowRoot) obj.attachShadow({ mode: 'open' });

  const servTemplateLoader = await wc.getService(obj.constructor._wcTemplateLoader);
  const elements = servTemplateLoader.run(obj.constructor._wcTemplate);
  if (!Array.isArray(elements)) throw 'result of template loader need to be an array of elements';

  for (const el of elements) {
    obj.shadowRoot.appendChild(el);
  }
};
