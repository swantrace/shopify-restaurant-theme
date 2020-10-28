import BSN from 'bootstrap.native';
import apis from './general/ajaxapis';
import tagimages from './general/tagimages';
import helper, { docReady, winLoad } from './general/helper';
import {
  registerCartupdatedEventListener,
  registerProductgridclickedEventListener,
} from './general/eventhandlers';
import preapreTestimonials from './sections/testimonials';
import prepareHeaderSection from './sections/header';
import prepareMasonryGallery from './sections/masonry-gallery';
import showModal from './sections/promobox';
import prepareVideoWithText from './sections/video-with-text';
import prepareCollectionNavigation from './sections/collection-navigation';
import prepareCollectionTags from './sections/collection-tags';
import prepareSingleCollection from './sections/single-collection';
import './components/predictive-search';
import './components/single-collection';
import './components/product-modal';
import './components/featured-product';
import './components/counter-product';

window.datomar = {
  BSN,
  apis,
  helper,
  tagimages,
};

docReady(() => {
  prepareHeaderSection();

  prepareMasonryGallery();
  preapreTestimonials();
  prepareVideoWithText(
    window.videoWithTextVideoId ? window.videoWithTextVideoId : '_9VUPq3SxOc'
  );

  prepareCollectionNavigation();
  prepareCollectionTags();
  prepareSingleCollection();

  registerCartupdatedEventListener();
  registerProductgridclickedEventListener();

  winLoad(() => {
    setTimeout(
      () => {
        showModal(
          window.promoboxExpires &&
            !Number.isNaN(Number(window.promoboxExpires))
            ? Number(window.promoboxExpires)
            : 30
        );
      },
      window.promoboxDelay && !Number.isNaN(Number(window.promoboxDelay * 1000))
        ? Number(window.promoboxDelay * 1000)
        : 5000
    );
  });
});
