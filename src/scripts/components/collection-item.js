/* eslint-disable no-console */
import { html, component, useState, useEffect } from 'haunted';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { dispatchCustomEvent, escape, unescape, formatMoney } from '../helper';
import { getCollectionWithProductsDetails } from '../ajaxapis';
import tagimages from '../tagimages';

function collectionItem({
  collectionHandle = '',
  collectionTitle = '',
  dataTag = '',
  dataStyle = 'light',
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
            <img
              class="img-fluid"
              src=${product.featured_image.replace('.jpg', '_200x.jpg')}
            />
          </div>
          <div style="float: left;width: 70%;">
            <h6>${product.title}</h6>
            <div>${unsafeHTML(product.description)}</div>
            <div>
              ${product.compare_at_price > product.price
                ? html`<div class="onsale-price">
                    <span class="current-variant-price"
                      >${formatMoney(product.price)}</span
                    >
                    <i class="fas fa-arrow-left"></i>
                    <span class="current-variant-compare-at-price"
                      >${formatMoney(product.compare_at_price)}</span
                    >
                  </div>`
                : html`<div class="normal-price">
                    <span class="current-variant-price"
                      >${formatMoney(product.price)}</span
                    >
                  </div>`}
            </div>
            <div>
              ${product.tags.map(
                (tag) =>
                  html`${tagimages[`${tag}_${dataStyle}`]
                    ? html`<img
                        src="${tagimages[`${tag}_${dataStyle}`]}"
                        width="20"
                      />`
                    : html``}`
              )}
            </div>
          </div>
        </div>`
      )}
    </div>`;
}

customElements.define(
  'collection-item',
  component(collectionItem, {
    useShadowDOM: false,
    observedAttributes: [
      'collection-handle',
      'collection-title',
      'data-tag',
      'data-style',
    ],
  })
);
