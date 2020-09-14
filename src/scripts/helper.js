export function attributeToString(attribute) {
  if (typeof attribute !== 'string') {
    attribute += '';
    if (attribute === 'undefined') {
      attribute = '';
    }
  }
  return attribute.trim();
}
