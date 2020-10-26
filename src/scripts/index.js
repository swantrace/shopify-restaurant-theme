import BSN from 'bootstrap.native';
import Cookies from 'js-cookie';
import apis from './ajaxapis';
import helper from './helper';
import './sections/testimonials';
import './sections/header';
import './sections/masonry-gallery';
import './components/predictive-search';
import './components/collection-item';
import './components/collection-item-modal';
import './components/featured-product';
import './components/counter-product';
import tagimages from './tagimages';

window.datomar = {
  BSN,
  apis,
  helper,
  Cookies,
  tagimages
};