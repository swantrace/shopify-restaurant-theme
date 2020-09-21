import Axios from 'axios';
import { isEmpty } from 'lodash';
import { attributeToString } from './helper';
const instance = Axios.create({
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});
const ajaxTemplateFunc = (url, method = 'get', data = {}) => {
  const encoded = encodeURI(url);
  let request;

  if (method == 'get') {
    if (isEmpty(data)) {
      request = instance.get(encoded);
    } else {
      request = instance.get(encoded, data);
    }
  } else {
    if (isEmpty(data)) {
      request = instance.post(encoded);
    } else {
      request = instance.post(encoded, data);
    }
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
  },
  getProduct = (handle) => {
    return ajaxTemplateFunc(`/products/${handle}.js`);
  },
  clearCart = () => {
    return ajaxTemplateFunc('/cart/clear.js', 'post');
  },
  updateCartFromForm = (form) => {
    return ajaxTemplateFunc('/cart/update.js', 'post', new FormData(form));
  },
  changeItemByKeyOrId = (id, quantity) => {
    return ajaxTemplateFunc('/cart/change.js', 'post', {
      quantity,
      id,
    });
  },
  removeItemByKeyOrId = (id) => {
    return ajaxTemplateFunc('/cart/change.js', 'post', { quantity: 0, id });
  },
  changeItemByLine = (line, quantity, properties) => {
    return ajaxTemplateFunc('/cart/change.js', 'post', {
      quantity,
      line,
      properties,
    });
  },
  removeItemByLine = (line) => {
    return ajaxTemplateFunc('/cart/change.js', 'post', { quantity: 0, line });
  },
  addItem = (id, quantity, properties = {}) => {
    return ajaxTemplateFunc('/cart/add.js', 'post', {
      id,
      quantity,
      properties,
    });
  },
  addItemFromForm = (form) => {
    return ajaxTemplateFunc('/cart/add.js', 'post', new FormData(form));
  },
  updateCartAttributes = (attributes) => {
    let data = '';
    if (Array.isArray(attributes)) {
      attributes.forEach((attribute) => {
        const key = attributeToString(attribute.key);
        if (key !== '') {
          data +=
            'attributes[' +
            key +
            ']=' +
            attributeToString(attribute.value) +
            '&';
        }
      });
    } else if (typeof attributes === 'object' && attributes !== null) {
      Object.keys(attributes).forEach((key) => {
        const value = attributes[key];
        data +=
          'attributes[' +
          attributeToString(key) +
          ']=' +
          attributeToString(value) +
          '&';
      });
    }
    return ajaxTemplateFunc('/cart/update.js', 'post', data);
  },
  updateCartNote = (note) => {
    return ajaxTemplateFunc(
      '/cart/update.js',
      'post',
      `note=${attributeToString(note)}`
    );
  },
  getCommendedProducts = (product_id, limit = 10) => {
    return ajaxTemplateFunc(
      `/recommendations/products.json?product_id=${product_id}&limit=${
        limit && parseInt(limit) > 0 && parseInt(limit) <= 10
          ? parseInt(limit)
          : 10
      }`
    );
  },
  getPredictiveSearchResults = (
    q,
    type = ['product', 'page', 'article', 'collection'],
    limit = 10,
    unavailable_products = 'last',
    fields = ['title', 'product_type', 'variants.title', 'vendor']
  ) => {
    let params_string = '';
    params_string += `q=${q}`;
    params_string += `&resources[type]=${type.join(',')}`;
    params_string += `&resources[limit]=${limit}`;
    params_string += `&resources[options][unavailable_products]=${unavailable_products}`;
    params_string += `&resources[options][fields]=${fields.join(',')}`;
    return ajaxTemplateFunc(`/search/suggest.json?${params_string}`);
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
  getCommendedProducts,
  getPredictiveSearchResults,
};
