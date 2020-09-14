import BSN from 'bootstrap.native';
import ajaxAPICreator from './ajaxapi';

window.datomar = {
  BSN,
  api: ajaxAPICreator({}),
};
