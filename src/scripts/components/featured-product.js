/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import { html, component } from 'haunted';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { useATCForm } from './common/custom-hooks';
import { formatMoney, resizeImage } from '../helper';

function featuredProduct({
  dataProduct,
  dataOptionsWithValues,
  dataSelectedOrFirstAvailableVariant,
  dataStyle = 'dark',
  dataSectionWidth = 'full',
  dataImagePosition = 'left',
  dataStyleForDesktop = 'styleA',
  dataAlignment = 'left',
}) {
  const [
    product,
    optionsWithValues,
    currentVariant,
    quantity,
    status,
    errorDescription,
    handleOptionChange,
    handleQuantityInputChange,
    handleATCButtonClick,
  ] = useATCForm(
    dataProduct,
    dataOptionsWithValues,
    dataSelectedOrFirstAvailableVariant
  );

  if (dataStyleForDesktop === 'styleC') {
    dataStyle = 'light';
  }

  return html`<div
    class="featured-product-container ${dataSectionWidth === 'container'
      ? 'container'
      : ''}"
  >
    <div
      class="row no-gutters ${dataSectionWidth === 'container'
        ? 'px-10'
        : 'px-0'}"
    >
      <div
        class="variant-image-wrapper col col-12 ${dataStyleForDesktop ===
        'styleC'
          ? 'col-lg-12'
          : 'col-lg-6'} align-self-center ${dataImagePosition === 'left'
          ? 'order-lg-first'
          : 'order-lg-last'}"
      >
        <div
          class="featured-badge ${dataImagePosition === 'left'
            ? 'img-left'
            : 'img-right'}   ${dataStyleForDesktop === 'styleC'
            ? 'd-lg-none'
            : ''}  "
        >
          <span class="featured-badge-text">Featured</span>
        </div>
        <img
          class="variant-image img-fluid w-100 h-100"
          src=${currentVariant.featured_image
            ? dataStyleForDesktop === 'styleC'
              ? resizeImage(currentVariant.featured_image, '1680x1050')
              : resizeImage(currentVariant.featured_image, '960x832')
            : dataStyleForDesktop === 'styleC'
            ? resizeImage(product.featured_image, '1680x960')
            : resizeImage(product.featured_image, '960x832')}
          style="object-fit: cover; object-position: center center;"
        />
      </div>
      <div
        class="product-item-wrapper col col-12 mt-30 mt-lg-0 ${dataSectionWidth ===
        'container'
          ? ''
          : 'px-20'} align-self-center ${dataStyleForDesktop === 'styleC'
          ? 'offset-lg-6 col-lg-6 px-lg-0 px-lg-0'
          : 'col-lg-6 px-lg-30'} text-${dataStyle}-text"
      >
        <div
          class="featured-badge-style-c  d-none ${dataStyleForDesktop ===
          'styleC'
            ? 'd-lg-block'
            : ''} "
        >
          <span class="featured-badge-text">Featured</span>
        </div>
        <div
          class="text-${dataAlignment} ${dataAlignment === 'left'
            ? 'm-auto mr-lg-auto'
            : dataAlignment === 'right'
            ? 'ml-lg-auto'
            : 'mx-lg-auto'} featured-product-content"
        >
          <h5 class="mb-10">${product.title}</h5>
          <h6 class="mb-10 product-price">
            ${currentVariant.compare_at_price > currentVariant.price
              ? html`<div class="onsale-price">
                  <span class="current-variant-price text-red"
                    >${formatMoney(currentVariant.price)}</span
                  >
                  <i class="fas fa-arrow-left text-red"></i>
                  <span class="current-variant-compare-at-price"
                    >${formatMoney(currentVariant.compare_at_price)}</span
                  >
                </div>`
              : html`<div class="normal-price">
                  <span class="current-variant-price"
                    >${formatMoney(currentVariant.price)}</span
                  >
                </div>`}
          </h6>
          <div class="product-desc">
            <small>${unsafeHTML(product.description)}</small>
          </div>
          <form
            method="post"
            action="/cart/add"
            id="product_form_5623171776665"
            accept-charset="UTF-8"
            class="shopify-product-form"
            enctype="multipart/form-data"
          >
            <input type="hidden" name="form_type" value="product" />
            <input type="hidden" name="utf8" value="✓" />
            <input
              name="id"
              value=${currentVariant && currentVariant.id}
              type="hidden"
            />
            ${optionsWithValues.map(
              (option) =>
                html`<div
                  class="selector-wrapper form-group"
                  ?hidden=${option.name === 'Title' &&
                  option.values[0] === 'Default Title'}
                >
                  <label class="" for=${option.name}>${option.name}:</label>
                  <select
                    id=${option.name}
                    data-option="option${option.position}"
                    @change=${handleOptionChange}
                    class="form-control py-0 bg-${dataStyle}-selector text-${dataStyle}-text font-weight-bold"
                  >
                    ${option.values.map(
                      (value) =>
                        html`<option
                          class="text text-${dataStyle}-text font-weight-bold"
                          value=${value}
                          ?selected=${currentVariant &&
                          currentVariant[`option${option.position}`] === value}
                        >
                          ${value}
                        </option>`
                    )}
                  </select>
                </div>`
            )}
            <div class="form-group">
              <input
                class="form-control quantity_input bg-${dataStyle}-selector text-${dataStyle}-text font-weight-bold"
                name="quantity"
                type="number"
                value=${quantity}
                @change=${handleQuantityInputChange}
                min="0"
                step="1"
              />
            </div>
            <div class="d-flex flex-wrap justify-content-between">
              <button
                ?disabled=${!currentVariant || !currentVariant.available}
                @click=${handleATCButtonClick}
                type="submit"
                name="add"
                class="form-control AddToCart btn col-12 col-md-5 btn-${dataStyle}-filled-btn text-${dataStyle}-filled-btn-text"
              >
                <span class="AddToCartText"
                  >${currentVariant && !currentVariant.available
                    ? html`Not Available`
                    : status === 'suspended'
                    ? html`Add To Cart`
                    : status === 'loading'
                    ? html`<span class="spinner-border"></span>`
                    : status === 'success'
                    ? html`Added`
                    : html``}</span
                >
              </button>
              <div
                class="btn-group align-self-center mt-10 mt-md-auto h-100 text-${dataStyle}-selector-icons"
                role="group"
              >
                <button class="detail-icon btn p-0 pr-3" type="button">
                  <i class="fa fa-list pr-2"></i>Detail
                </button>
                <button class="share-icon btn p-0" type="button">
                  <i class="fa fa-share-alt pr-2"></i>Share
                </button>
              </div>
            </div>
          </form>
          <div class="error-description" ?hidden=${errorDescription === ''}>
            ${errorDescription}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

customElements.define(
  'featured-product',
  component(featuredProduct, {
    useShadowDOM: false,
    observedAttributes: [
      'data-product',
      'data-selected-or-first-available-variant',
      'data-options-with-values',
      'data-style',
      'data-section-width',
      'data-image-position',
      'data-style-for-desktop',
      'data-alignment',
    ],
  })
);
