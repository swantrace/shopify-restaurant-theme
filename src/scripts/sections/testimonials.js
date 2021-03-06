import Glider from 'glider-js';

export default function preapreTestimonials() {
  if (document.querySelector('.glider')) {
    // eslint-disable-next-line no-new
    new Glider(document.querySelector('.glider'), {
      // Mobile-first defaults
      slidesToShow: 1,
      slidesToScroll: 1,
      scrollLock: true,
      dots: '#resp-dots',
      draggable: true,
      arrows: {
        prev: '.glider-prev',
        next: '.glider-next',
      },
      responsive: [
        {
          // screens greater than >= 775px
          breakpoint: 0,
          settings: {
            // Set to `auto` and provide item width to adjust to viewport
            slidesToShow: 1,
            slidesToScroll: 1,
            itemWidth: 300,
            duration: 1,
          },
        },
        {
          // screens greater than >= 1024px
          breakpoint: 540,
          settings: {
            slidesToShow: 'auto',
            slidesToScroll: 'auto',
            itemWidth: 300,
            duration: 1,
          },
        },
      ],
    });
  }
}
