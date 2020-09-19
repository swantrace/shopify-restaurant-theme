import BSN from 'bootstrap.native';
import ajaxAPICreator from './ajaxapi';
import './sections/testimonials';
import './sections/header';
import './sections/masonry-gallery';

window.datomar = {
  BSN,
  api: ajaxAPICreator({}),
};
