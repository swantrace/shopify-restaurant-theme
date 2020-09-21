import { toggleClass, removeClass } from '../helper';

document.addEventListener('click', (event) => {
  const { target } = event;
  if (target.closest('.dropdown-menu')) {
    event.stopPropagation();
  }
  // class="navbar-toggler" data-trigger="#navbar_main"
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
    const screenOverlay = document.querySelector('.screen-overlay');
    if (screenOverlay) {
      toggleClass(screenOverlay, 'show');
    }
  }

  if (target.closest('.btn-close, .screen-overlay')) {
    const screenOverlay = document.querySelector('.screen-overlay');
    if (screenOverlay) {
      removeClass(screenOverlay, 'show');
    }
    const mobileOffcanvas = document.querySelector('.mobile-offcanvas');
    if (mobileOffcanvas) {
      removeClass(mobileOffcanvas, 'show');
    }
    removeClass(document.body, 'offcanvas-active');
  }
});
