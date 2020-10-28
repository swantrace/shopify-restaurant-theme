import tagimages from '../general/tagimages';

export default function prepareSingleCollection() {
  const tagImages = document.querySelectorAll(
    '[data-tag][data-style].tag-image'
  );
  Object.keys(tagImages).forEach((key) => {
    const tagImage = tagImages[key];
    const src = tagimages[`${tagImage.dataset.tag}_${tagImage.dataset.style}`];
    if (src) {
      tagImage.src = src;
    } else {
      tagImage.remove();
    }
  });

  document.addEventListener(
    'click',
    (event) => {
      const { target } = event;
      if (target.closest('.collection-products-wrapper .product-grid')) {
        const productGrid = target.closest(
          '.collection-products-wrapper .product-grid'
        );
        const product = JSON.parse(productGrid.dataset.product);
        const optionsWithValues = JSON.parse(
          productGrid.dataset.optionsWithValues
        );
        product.options = optionsWithValues;
        const customEvent = new CustomEvent('productgridclicked', {
          detail: { product },
        });
        document.dispatchEvent(customEvent);
      }
    },
    true
  );
}
