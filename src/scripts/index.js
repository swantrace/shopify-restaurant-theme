import BSN from 'bootstrap.native';
import Cookies from 'js-cookie';
import apis from './ajaxapis';
import helper from './helper';
import './sections/testimonials';
import './sections/header';
import './sections/masonry-gallery';
import './components/predictive-search';
import './components/single-collection';
import './components/product-modal';
import './components/featured-product';
import './components/counter-product';
import tagimages from './tagimages';

window.datomar = {
  BSN,
  apis,
  helper,
  Cookies,
  tagimages,
};

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('cartupdated', (event2) => {
    const cart = event2.detail && event2.detail.cart;
    if (cart && cart.item_count) {
      const cartIcons = document.querySelectorAll(
        '[data-cart-count].fas.fa-shopping-cart'
      );
      cartIcons.forEach((cartIcon) => {
        cartIcon.setAttribute('data-cart-count', cart.item_count);
      });
    }
  });
});
