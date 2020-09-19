import { toggleClass, removeClass } from '../helper.js';

document.addEventListener('click', function (event) {
  const target = event.target;
  if (target.closest('.dropdown-menu')) {
    console.log('prevent dropdown menu from closing');
    event.stopPropagation();
  }
  // class="navbar-toggler" data-trigger="#navbar_main"
  if (target.closest('.navbar-toggler[data-trigger]')) {
    event.preventDefault();
    event.stopPropagation();
    const offcanvas_id = target
      .closest('.navbar-toggler[data-trigger]')
      .getAttribute('data-trigger');
    const offcanvas = document.querySelector(offcanvas_id);
    if (offcanvas) {
      toggleClass(offcanvas, 'show');
    }
    toggleClass(document.body, 'offcanvas-active');
    const screen_overlay = document.querySelector('.screen-overlay');
    if (screen_overlay) {
      toggleClass(screen_overlay, 'show');
    }
  }

  if (target.closest('.btn-close, .screen-overlay')) {
    const screen_overlay = document.querySelector('.screen-overlay');
    if (screen_overlay) {
      removeClass(screen_overlay, 'show');
    }
    const mobile_offcanvas = document.querySelector('.mobile-offcanvas');
    if (mobile_offcanvas) {
      removeClass(mobile_offcanvas, 'show');
    }
    removeClass(document.body, 'offcanvas-active');
  }
});
