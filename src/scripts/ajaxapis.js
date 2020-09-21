import Axios from 'axios';
import { isEmpty } from 'lodash';
import { attributeToString } from './helper';

const instance = Axios.create({
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});
const ajaxTemplateFunc = (url, method = 'get', data = {}) => {
  const encoded = encodeURI(url);
  let request;

  if (method === 'get') {
    if (isEmpty(data)) {
      request = instance.get(encoded);
    } else {
      request = instance.get(encoded, data);
    }
  } else if (isEmpty(data)) {
    request = instance.post(encoded);
  } else {
    request = instance.post(encoded, data);
  }
  return request
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.response.data;
    });
};
// todo: urlencode

export const getCart = () => {
  return ajaxTemplateFunc('/cart.js');
};
export const getProduct = (handle) => {
  return ajaxTemplateFunc(`/products/${handle}.js`);
};
export const clearCart = () => {
  return ajaxTemplateFunc('/cart/clear.js', 'post');
};
export const updateCartFromForm = (form) => {
  return ajaxTemplateFunc('/cart/update.js', 'post', new FormData(form));
};
export const changeItemByKeyOrId = (id, quantity) => {
  return ajaxTemplateFunc('/cart/change.js', 'post', {
    quantity,
    id,
  });
};
export const removeItemByKeyOrId = (id) => {
  return ajaxTemplateFunc('/cart/change.js', 'post', { quantity: 0, id });
};
export const changeItemByLine = (line, quantity, properties) => {
  return ajaxTemplateFunc('/cart/change.js', 'post', {
    quantity,
    line,
    properties,
  });
};
export const removeItemByLine = (line) => {
  return ajaxTemplateFunc('/cart/change.js', 'post', { quantity: 0, line });
};
export const addItem = (id, quantity, properties = {}) => {
  return ajaxTemplateFunc('/cart/add.js', 'post', {
    id,
    quantity,
    properties,
  });
};
export const addItemFromForm = (form) => {
  return ajaxTemplateFunc('/cart/add.js', 'post', new FormData(form));
};
export const updateCartAttributes = (attributes) => {
  let data = '';
  if (Array.isArray(attributes)) {
    attributes.forEach((attribute) => {
      const key = attributeToString(attribute.key);
      if (key !== '') {
        data += `attributes[${key}]=${attributeToString(attribute.value)}&`;
      }
    });
  } else if (typeof attributes === 'object' && attributes !== null) {
    Object.keys(attributes).forEach((key) => {
      const value = attributes[key];
      data += `attributes[${attributeToString(key)}]=${attributeToString(
        value
      )}&`;
    });
  }
  return ajaxTemplateFunc('/cart/update.js', 'post', data);
};
export const updateCartNote = (note) => {
  return ajaxTemplateFunc(
    '/cart/update.js',
    'post',
    `note=${attributeToString(note)}`
  );
};
export const getRecommendedProducts = (productId, limit = 10) => {
  return ajaxTemplateFunc(
    `/recommendations/products.json?product_id=${productId}&limit=${
      limit && parseInt(limit, 10) > 0 && parseInt(limit, 10) <= 10
        ? parseInt(limit, 10)
        : 10
    }`
  );
};
export const getPredictiveSearchResults = (
  q,
  type = ['product', 'page', 'article', 'collection'],
  limit = 10,
  unavailableProducts = 'last',
  fields = ['title', 'product_type', 'variants.title', 'vendor']
) => {
  let paramsString = '';
  paramsString += `q=${q}`;
  paramsString += `&resources[type]=${type.join(',')}`;
  paramsString += `&resources[limit]=${limit}`;
  paramsString += `&resources[options][unavailable_products]=${unavailableProducts}`;
  paramsString += `&resources[options][fields]=${fields.join(',')}`;
  return ajaxTemplateFunc(`/search/suggest.json?${paramsString}`);
};

export default {
  getCart,
  getProduct,
  clearCart,
  updateCartFromForm,
  changeItemByKeyOrId,
  removeItemByKeyOrId,
  changeItemByLine,
  removeItemByLine,
  addItem,
  addItemFromForm,
  updateCartAttributes,
  updateCartNote,
  getRecommendedProducts,
  getPredictiveSearchResults,
};
