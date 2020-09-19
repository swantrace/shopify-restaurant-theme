export function attributeToString(attribute) {
  if (typeof attribute !== 'string') {
    attribute += '';
    if (attribute === 'undefined') {
      attribute = '';
    }
  }
  return attribute.trim();
}

export function toggleClass(elem, className) {
  elem.classList.toggle(className);
}

export function removeClass(elem, ...classNames) {
  elem.classList.remove(...classNames);
  return elem;
}
