import Macy from 'macy';

Macy({
  container: '.index-section--masonry .images-wrapper',
  columns: 3,
  breakAt: {
    520: 2,
    400: 1,
  },
});
