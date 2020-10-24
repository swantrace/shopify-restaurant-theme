/* eslint-disable no-console */
import { html, component, useState, useEffect } from 'haunted';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import {
  dispatchCustomEvent,
  escape,
  unescape,
  formatMoney,
  handleize,
} from '../helper';
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
  return html`<h4 class="collection-name text-center py-20">${collectionTitle}</h4>
    <div class="row">
      ${collection.products &&
      collection.products.map(
        (product) => html`<div
          class="product-grid col-12 col-sm-12 col-md-6 d-flex pb-20 flex-wrap"
          @click=${(e) => {
            handleClick(product, e);
          }}
        >
          <div class="col-4 p-0">
            <img
              class="img-fluid product-img"
              src=${product.featured_image.replace('.jpg', '_200x.jpg')}
            />
          </div>
          <div class="col-8">
            <h6 class="product-title mb-5">${product.title}</h6>
            <div class="product-desc mb-10">${unsafeHTML(product.description)}</div>
            <div class="product-price mb-5">
              ${product.compare_at_price > product.price
                ? html`<div class="onsale-price">
                    <span class="current-variant-price pr-2"
                      >${formatMoney(product.price)}</span
                    >
                    <i class="fas fa-arrow-left"></i>
                    <span class="current-variant-compare-at-price pl-2"
                      >${formatMoney(product.compare_at_price)}</span
                    >
                  </div>`
                : html`<div class="normal-price">
                    <span class="current-variant-price"
                      >${formatMoney(product.price)}</span
                    >
                  </div>`}
            </div>
            <div class="tags-list mb-20">
              ${product.tags.map(
                (tag) =>
                  html`${tagimages[
                    `${handleize(tag).replace('-', '_')}_${dataStyle}`
                  ]
                    ? html`<img
                        src="${tagimages[
                          `${handleize(tag).replace('-', '_')}_${dataStyle}`
                        ]}"
                        width="20"
                      />`
                    : html``}`
              )}
            </div>
          </div>
          <hr class="divider">
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
