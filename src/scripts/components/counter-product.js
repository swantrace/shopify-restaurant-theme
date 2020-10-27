/* eslint-disable no-nested-ternary */
import { html, component, useState, useEffect } from 'haunted';
import moment from 'moment';
import { useATCForm } from './common/custom-hooks';
import { formatMoney, resizeImage } from '../helper';

function CounterProduct({
  dataProduct,
  dataSelectedOrFirstAvailableVariant,
  dataOptionsWithValues,
  dataStyle = 'dark',
  dataSectionWidth = 'full',
  dataImagePosition = 'left',
  dataStyleForDesktopAndMobile = 'styleA',
  dataAlignment = 'left',
  dataDiscountDeadline = '2030-01-01T00:00',
  dataAddToCartButtonText = 'ADD TO CART',
  dataLearnMoreButtonText = 'LEARN MORE',
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

  const deadline = moment(dataDiscountDeadline);
  const [leftTime, setLeftTime] = useState(deadline.diff(moment()));

  useEffect(() => {
    const timer = setInterval(() => {
      setLeftTime(leftTime - 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, [leftTime]);

  return html`<div
    class="onsale-product-container ${dataSectionWidth === 'container'
      ? 'container'
      : ''}"
  >
    <div class="row no-gutters">
      <div
        class="variant-image-wrapper col col-12 ${dataStyleForDesktopAndMobile ===
        'styleC'
          ? 'col-lg-12'
          : 'col-lg-6'} align-self-center ${dataImagePosition === 'left'
          ? 'order-lg-first'
          : 'order-lg-last'}"
      >
        <div
          class="featured-badge ${dataImagePosition === 'left'
            ? 'img-left'
            : 'img-right'} "
        >
          <span class="featured-badge-text">Featured</span>
        </div>

        <img
          class="variant-image img-fluid w-100 h-100"
          src=${currentVariant.featured_image
            ? resizeImage(currentVariant.featured_image, '1200x800')
            : resizeImage(product.featured_image, '1200x800')}
        />
      </div>
      <div
        class="product-item-wrapper col col-12 col-lg-6 align-self-center pt-15 pt-lg-0 px-15 px-lg-30 text-${dataStyle}-text"
      >
        <div
          class="text-${dataAlignment} ${dataAlignment === 'left'
            ? 'mr-auto'
            : dataAlignment === 'right'
            ? 'ml-auto'
            : 'mx-auto'}"
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
          <div class="row mb-10 justify-content-between">
            <div class="col-3">
              <div class="bg-gray2 p-5 text-${dataStyle}-text">
                <h3 class="text-center">
                  ${Math.floor(moment.duration(leftTime).asDays())}
                </h3>
                <small class="d-block text-center">days</small>
              </div>
            </div>
            <div class="col-3">
              <div class="bg-gray2 p-5 text-${dataStyle}-text">
                <h3 class="text-center">
                  ${moment.duration(leftTime).hours()}
                </h3>
                <small class="d-block text-center">hours</small>
              </div>
            </div>
            <div class="col-3">
              <div class="bg-gray2 p-5 text-${dataStyle}-text">
                <h3 class="text-center">
                  ${moment.duration(leftTime).minutes()}
                </h3>
                <small class="d-block text-center">minutes</small>
              </div>
            </div>
            <div class="col-3">
              <div class="bg-gray2 p-5 text-${dataStyle}-text">
                <h3 class="text-center">
                  ${moment.duration(leftTime).seconds()}
                </h3>
                <small class="d-block text-center">seconds</small>
              </div>
            </div>
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
            <div
              class="d-flex flex-wrap justify-content-between align-items-start"
            >
              <div class="col-12 col-md-4 col-lg-5 px-0">
                <button
                  ?disabled=${!currentVariant || !currentVariant.available}
                  @click=${handleATCButtonClick}
                  type="submit"
                  name="add"
                  class="form-control AddToCart btn btn-${dataStyle}-filled-btn text-${dataStyle}-filled-btn-text px-2 mb-8"
                >
                  <span class="AddToCartText"
                    >${currentVariant && !currentVariant.available
                      ? html`Not Available`
                      : status === 'suspended'
                      ? html`${dataAddToCartButtonText.toUpperCase()}`
                      : status === 'loading'
                      ? html`<span class="spinner-border"></span>`
                      : status === 'success'
                      ? html`Added`
                      : html``}</span
                  >
                </button>
                <a
                  href=${`/products/${product.handle}`}
                  class="btn btn-${dataStyle}-outline-btn text-${dataStyle}-outline-btn-text border-${dataStyle}-outline-btn-border w-100"
                  >${dataLearnMoreButtonText.toUpperCase()}</a
                >
              </div>
              <div class="btn-group mt-10 mt-md-auto h-100" role="group">
                <button
                  class="detail-icon btn p-0 pr-3 text-${dataStyle}-selector-icons"
                  type="button"
                >
                  <i class="fa fa-list pr-2"></i>Detail
                </button>
                <button
                  class="share-icon btn p-0 text-${dataStyle}-selector-icons"
                  type="button"
                >
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
  'counter-product',
  component(CounterProduct, {
    useShadowDOM: false,
    observedAttributes: [
      'data-product',
      'data-selected-or-first-available-variant',
      'data-options-with-values',
      'data-style',
      'data-section-width',
      'data-image-position',
      'data-style-for-desktop-and-mobile',
      'data-alignment',
      'data-discount-deadline',
      'data-add-to-cart-button-text',
      'data-learn-more-button-text',
    ],
  })
);
