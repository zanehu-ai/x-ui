export function componentHref(name, examples) {
  if (!Object.hasOwn(examples, name)) throw new Error('Unknown component');
  return `/components?component=${encodeURIComponent(name)}#${examples[name]}`;
}

export function selectionFromLocation(location, examples) {
  const anchor = location.hash.slice(1);
  const name = new URLSearchParams(location.search).get('component');
  if (name && Object.hasOwn(examples, name) && (!anchor || examples[name] === anchor)) return name;
  return Object.keys(examples).find(key => examples[key] === anchor) || null;
}

export function searchExampleIds(query, groups, inventory, examples) {
  const term = query.trim().toLowerCase();
  const ids = new Set();
  for (const group of groups) {
    const groupMatches = group.label.toLowerCase().includes(term);
    for (const name of inventory[group.id]) {
      if (groupMatches || name.toLowerCase().includes(term)) ids.add(examples[name]);
    }
  }
  return [...ids];
}
