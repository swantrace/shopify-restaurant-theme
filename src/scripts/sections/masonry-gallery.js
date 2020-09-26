import Macy from 'macy';

if (document.querySelector('.index-section--masonry .images-wrapper')) {
  Macy({
    container: '.index-section--masonry .images-wrapper',
    columns: 3,
    breakAt: {
      520: 2,
      400: 1,
    },
  });
}
