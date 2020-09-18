import BSN from 'bootstrap.native';
import ajaxAPICreator from './ajaxapi';

window.datomar = {
  BSN,
  api: ajaxAPICreator({}),
};

// const alert = new BSN.Alert('#test-alert');
// const alertElement = alert.element;

// alertElement.addEventListener(
//   'closed.bs.alert',
//   function (event) {
//     console.log(event);
//   },
//   false
// );

// const buttonGroup = new BSN.Button('#myRadioButtonGroup');
window.addEventListener('load', function () {
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
});
