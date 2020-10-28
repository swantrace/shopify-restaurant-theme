export default function prepareCollectionNavigation() {
  const currentHash = window.location.hash;
  if (currentHash !== '') {
    const activeLink = document.querySelector(`[href="${currentHash}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  const links = document.querySelectorAll('.collection-titles a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      if (!link.classList.contains('active')) {
        const currentActiveLink = document.querySelector(
          '.collection-titles a.active'
        );
        if (currentActiveLink) {
          currentActiveLink.classList.remove('active');
        }
        link.classList.add('active');
      }
    });
  });
}
