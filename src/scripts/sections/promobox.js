import Cookies from 'js-cookie';
import BSN from 'bootstrap.native';

export default function showModal(expires) {
  const promoboxSectionElement = document.querySelector(
    '.index-section--promobox'
  );
  if (promoboxSectionElement && !Cookies.get('promobox')) {
    const modalElement = promoboxSectionElement.querySelector('.modal');
    const modal = new BSN.Modal(modalElement, {
      backdrop: true,
      keyboard: false,
    });
    modal.show();
    Cookies.set('promobox', 'shown', { expires });
  }
}
