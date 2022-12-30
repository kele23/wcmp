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
export const getRefs = (rootElement, refName, all = true) => {
  let elements = [];
  switch (refName) {
    case 'root':
      elements = [rootElement];
      break;
    default:
      elements = Array.from(rootElement.querySelectorAll(`[data-ref=${refName}]`));
      break;
  }

  if (all) return elements;
  else return elements.length > 0 ? elements[0] : null;
};
