import BSN from 'bootstrap.native';
import ajaxAPICreator from './ajaxapi';
import './sections/testimonials';
import './sections/header';

window.datomar = {
  BSN,
  api: ajaxAPICreator({}),
};
