import Macy from 'macy';

const macyInstance = Macy({
  container: '.index-section--masonry .images-wrapper',
  columns: 3,
  breakAt: {
    520: 2,
    400: 1,
  },
});
