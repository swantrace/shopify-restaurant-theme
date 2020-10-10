/* eslint-disable no-console */
import { html, component, useState, useEffect } from 'haunted';
import { dispatchCustomEvent, escape, unescape } from '../helper';
import { getCollectionWithProductsDetails } from '../ajaxapis';

function collectionItem({
  collectionHandle = '',
  collectionTitle = '',
  dataTag = '',
}) {
  const [collection, setCollection] = useState({});
  useEffect(() => {
    if (collectionHandle !== '') {
      getCollectionWithProductsDetails(
        collectionHandle,
        dataTag,
        (updatedCollection) => {
          setCollection(updatedCollection);
        }
      ).then((updatedCollection) => {
        setCollection(updatedCollection);
      });
    }
  }, [collectionHandle, dataTag]);
  const handleClick = (product, e) => {
    dispatchCustomEvent(
      e.target.closest('.product-grid'),
      'productgridclicked',
      {
        bubbles: true,
        composed: true,
        detail: { originalEvent: e, product, escape, unescape },
      }
    );
  };
  return html`<h5>${collectionTitle}</h5>
    <div class="row">
      ${collection.products &&
      collection.products.map(
        (product) => html`<div
          class="product-grid col-12 col-sm-12 col-md-6"
          @click=${(e) => {
            handleClick(product, e);
          }}
        >
          <div style="float: right;width: 30%;">
            <img class="img-fluid" src="https://picsum.photos/300/300" />
          </div>
          <div style="float: left;width: 70%;">
            <h6>${product.title}</h6>
            <p>
              Lorem ipsum dolor sit ament, consectetuer adipiscing elit, sed
              diam nonummy nibh euismod lincidunt ut laoreet dolore magna
              aliquam erat
            </p>
            <p>
              <span class="text-danger">$100 .00 ← </span>
              <span>$120.00</span>
            </p>
            <p>
              <img
                height="20"
                src="https://picsum.photos/20/20"
                width="20"
              /><img
                height="20"
                src="https://picsum.photos/20/20"
                width="20"
              /><img
                height="20"
                src="https://picsum.photos/20/20"
                width="20"
              /><img
                height="20"
                src="https://picsum.photos/20/20"
                width="20"
              /><img height="20" src="https://picsum.photos/20/20" width="20" />
            </p>
          </div>
        </div>`
      )}
    </div>`;
}

customElements.define(
  'collection-item',
  component(collectionItem, {
    useShadowDOM: false,
    observedAttributes: ['collection-handle', 'collection-title', 'data-tag'],
  })
);
