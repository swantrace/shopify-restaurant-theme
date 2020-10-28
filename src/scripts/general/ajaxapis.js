/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable camelcase */
import Axios from 'axios';
import mapLimit from 'async.maplimit';
import { attributeToString } from './helper';

const instance = Axios.create({
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});
const ajaxTemplateFunc = (url, method = 'get', data = {}, config = {}) => {
  const encoded = encodeURI(url);
  let request;
  if (method === 'get') {
    request = instance.get(encoded, config);
  } else {
    request = instance.post(encoded, data, config);
  }
  return request
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error && error.response && error.response.data;
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
export const _getPageCollection = (handle, page = 1, tag = '') => {
  return ajaxTemplateFunc(
    typeof tag !== 'string' || tag === ''
      ? `/collections/${handle}?view=theme&page=${page}`
      : `/collections/${handle}/${tag}?view=theme&page=${page}`,
    'get',
    {},
    { headers: { accept: 'text/html' } }
  );
};

export const getCollection = (handle, tag = '') => {
  return new Promise((resolve) => {
    let products_handles = [];
    const current_page = 1;
    const getPageCollection = (handle, current_page, tag) => {
      _getPageCollection(handle, current_page, tag).then((collection) => {
        products_handles = [
          ...products_handles,
          ...collection.products_handles,
        ];
        if (collection.paginate.current_page < collection.paginate.pages) {
          current_page += 1;
          getPageCollection(handle, current_page, tag);
        } else {
          resolve({ ...collection, products_handles });
        }
      });
    };
    getPageCollection(handle, current_page, tag);
  });
};

export const getCollectionWithProductsDetails = (
  handle,
  tag = '',
  productsLoadedCallback
) => {
  return new Promise((resolve, reject) => {
    getCollection(handle, tag).then((collection) => {
      const productsHandles = collection.products_handles;
      let productsCount = productsHandles.length;
      let tmpProducts = [];
      let updatedCollection = collection;
      mapLimit(
        productsHandles,
        5,
        (productHandle, callback) => {
          getProduct(productHandle)
            .then((product) => {
              productsCount -= 1;
              tmpProducts.push(product);
              if (tmpProducts.length === 5 || productsCount === 0) {
                if (typeof productsLoadedCallback === 'function') {
                  updatedCollection = {
                    ...collection,
                    products: [
                      ...(updatedCollection.products || []),
                      ...tmpProducts,
                    ],
                  };
                  productsLoadedCallback(updatedCollection);
                }
                tmpProducts = [];
              }
              return product;
            })
            .then((product) => {
              callback(null, product);
            })
            .catch((error) => {
              callback(error);
            });
        },
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            collection.products = results;
            resolve(collection);
          }
        }
      );
    });
  });
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
  _getPageCollection,
  getCollection,
  getCollectionWithProductsDetails,
};
