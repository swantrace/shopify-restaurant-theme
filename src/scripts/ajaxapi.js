import Axios from 'axios';
import { attributeToString } from './helper';
export default function (axiosConfig, ...args) {
  const instance = Axios.create(axiosConfig);
  return {
    getCart() {
      return instance.get('/cart.js');
    },
    getProduct(handle) {
      return instance.get(`/products/${handle}.js`);
    },
    clearCart() {
      return instance.post('/cart/clear.js');
    },
    updateCartFromForm(form) {
      return instance.post('/cart/update.js', new FormData(form));
    },
    changeItemByKeyOrId(keyOrId, quantity) {
      return instance.post('/cart/change.js', {
        quantity: quantity,
        id: keyOrId,
      });
    },
    removeItemByKeyOrId(keyOrId) {
      return instance.post('/cart/change.js', { quantity: 0, id: keyOrId });
    },
    changeItemByLine(line, quantity) {
      return instance.post('/cart/change.js', { quantity, line });
    },
    removeItemByLine(line) {
      return instance.post('/cart/change.js', { quantity: 0, line });
    },
    addItem(id, quantity, properties) {
      return instance.post('/cart/add.js', {
        id,
        quantity,
        properties,
      });
    },
    addItemFromForm(form) {
      return instance.post('/cart/add.js', new FormData(form));
    },
    updateCartAttributes(attributes) {
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
      return instance.post('/cart/update.js', data);
    },
    updateCartNote(note) {
      return instance.post(
        '/cart/update.js',
        `note=${attributeToString(note)}`
      );
    },
  };
}
