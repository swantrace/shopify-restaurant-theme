import Macy from 'macy';

export default function prepareMasonryGallery() {
  if (document.querySelector('.index-section--masonry .images-wrapper')) {
    Macy({
      container: '.index-section--masonry .images-wrapper',
      columns: 3,
      breakAt: {
        940: 2,
        520: 1,
        400: 1,
      },
    });
  }
}
