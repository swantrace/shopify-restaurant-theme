import { toggleClass } from '../general/helper';

export default function prepareHeaderSection() {
  document.addEventListener(
    'click',
    (event) => {
      const { target } = event;
      if (target.closest('.dropdown-menu')) {
        event.stopPropagation();
      }
      if (target.closest('.navbar-toggler[data-trigger]')) {
        event.preventDefault();
        event.stopPropagation();
        const offcanvasId = target
          .closest('.navbar-toggler[data-trigger]')
          .getAttribute('data-trigger');
        const offcanvas = document.querySelector(offcanvasId);
        if (offcanvas) {
          toggleClass(offcanvas, 'show');
        }
        toggleClass(document.body, 'offcanvas-active');
      }
    },
    true
  );
}
