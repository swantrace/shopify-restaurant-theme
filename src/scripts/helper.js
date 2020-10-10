/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-param-reassign */
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

export function dispatchCustomEvent(elem, eventName, properties) {
  elem.dispatchEvent(new CustomEvent(eventName, properties));
}

export function formatMoney(cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || '${{amount}}';

  function formatWithDelimiters(
    number,
    precision = 2,
    thousands = ',',
    decimal = '.'
  ) {
    if (Number.isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split('.');
    const dollarsAmount = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      `$1${thousands}`
    );
    const centsAmount = parts[1] ? decimal + parts[1] : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
    default:
      value = formatWithDelimiters(cents, 2);
  }

  return formatString.replace(placeholderRegex, value);
}

export function isNil(value) {
  return value === null || value === undefined;
}

export function stringify(value) {
  return isNil(value) ? '' : String(value);
}

const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;',
};
const unescapeMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#34;': '"',
  '&#39;': "'",
};

export function escape(str) {
  return stringify(str).replace(/&|<|>|"|'/g, (m) => escapeMap[m]);
}

export function unescape(str) {
  return String(str).replace(/&(amp|lt|gt|#34|#39);/g, (m) => unescapeMap[m]);
}

export default {
  attributeToString,
  toggleClass,
  removeClass,
  dispatchCustomEvent,
  formatMoney,
  isNil,
  stringify,
  escape,
  unescape,
};
