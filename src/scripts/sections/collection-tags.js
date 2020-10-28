export default function prepareCollectionTags() {
  if (document.getElementById('FilterBy')) {
    const filterBy = document.getElementById('FilterBy');
    filterBy.addEventListener('change', (e) => {
      const { value } = e.target;
      const collectionItems = document.querySelectorAll('single-collection');
      if (collectionItems.length > 0) {
        if (value === '') {
          collectionItems.forEach((collectionItem) => {
            collectionItem.removeAttribute('data-tag');
          });
        } else {
          collectionItems.forEach((collectionItem) => {
            collectionItem.setAttribute('data-tag', value);
          });
        }
      } else {
        // redirect to page with the tag or not
      }
    });
  }
}
