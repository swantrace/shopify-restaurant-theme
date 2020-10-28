import BSN from 'bootstrap.native';
import { empty, escape } from './helper';

export function registerCartupdatedEventListener() {
  document.addEventListener('cartupdated', (e) => {
    const cart = e.detail && e.detail.cart;
    if (cart && cart.item_count) {
      const cartIcons = document.querySelectorAll(
        '[data-cart-count].fas.fa-shopping-cart'
      );
      cartIcons.forEach((cartIcon) => {
        cartIcon.setAttribute('data-cart-count', cart.item_count);
      });
    }
  });
}

export function registerProductgridclickedEventListener() {
  document.addEventListener('productgridclicked', (event) => {
    const modalElement = document.getElementById('atcFormModal');
    const modal = new BSN.Modal(modalElement, {
      backdrop: true,
      keyboard: false,
    });
    const { product } = event.detail;

    modalElement.addEventListener('show.bs.modal', (e) => {
      e.target.innerHTML = `
        <product-modal
            data-product="${escape(JSON.stringify(product))}"
            data-selected-or-first-available-variant="${product.variants[0].id}"
            data-options-with-values="${escape(
              JSON.stringify(product.options)
            )}"
            data-extra-price="0"
            data-style="${
              window.default_style_mode ? window.default_style_mode : 'light'
            }"
          ></product-modal>`;
      modalElement.addEventListener('hidden.bs.modal', (e2) => {
        empty(e2.target);
      });
      modalElement.addEventListener('modaladdtocartfinished', () => {
        modal.hide();
      });
    });
    modal.show();
  });
}

export default {
  registerCartupdatedEventListener,
  registerProductgridclickedEventListener,
};
