/* eslint-disable no-nested-ternary */
import { html, component } from 'haunted';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { useATCForm } from './common/custom-hooks';
import { formatMoney, handleize } from '../helper';
import tagimages from '../tagimages';

function collectionItemModal({
  dataProduct,
  dataSelectedOrFirstAvailableVariant,
  dataOptionsWithValues,
  dataStyle = 'light',
  dataExtraPrice,
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

  const extraPrice = Number.isNaN(Number(dataExtraPrice))
    ? 0
    : parseInt(Number(dataExtraPrice), 10);

  return html`<div class="modal-dialog collection-item-modal">
    <div class="modal-content collection-item-modal-inner product-item-wrapper">
      <img
        class="img-fluid collection-item-modal-image"
        src=${
          currentVariant.featured_image
            ? currentVariant.featured_image
                .replace('.jpg', '_500x.jpg')
                .replace('.png', '_500x.png')
            : product.featured_image
                .replace('.jpg', '_500x.jpg')
                .replace('.png', '_500x.png')
        }
      />
      <i class="fas fa-times modal-close-icon" data-dismiss="modal" style="
          position: absolute;
          top: 0;
          right: 0;
          font-size: 30px;
          cursor: pointer;
      "></i>
      <div class="modal-body bg-${dataStyle} text-${dataStyle}-text">
        <div class="collection-item-modal-info">
          <h5 class="collection-item-modal-title">${product.title}</h5>
          <div class="collection-item-modal-description">
            ${unsafeHTML(product.description)}
          </div>
          <div class="collection-item-modal-tags">
            ${product.tags.map(
              (tag) =>
                html`${tagimages[
                  `${handleize(tag).replace('-', '_')}_${dataStyle}`
                ]
                  ? html`<img
                      src=${tagimages[
                        `${handleize(tag).replace('-', '_')}_${dataStyle}`
                      ]}
                      width="20"
                    />`
                  : html``}`
            )}
          </div>
          <div class="collection-item-modal-price">
            ${
              currentVariant.compare_at_price > currentVariant.price
                ? html`<div class="onsale-price">
                    <span class="current-variant-price"
                      >${formatMoney(currentVariant.price)}</span
                    >
                    <i class="fas fa-arrow-left"></i>
                    <span class="current-variant-compare-at-price"
                      >${formatMoney(currentVariant.compare_at_price)}</span
                    >
                  </div>`
                : html`<div class="normal-price">
                    <span class="current-variant-price"
                      >${formatMoney(currentVariant.price)}</span
                    >
                  </div>`
            }
          </div>
          <form
            method="post"
            action="/cart/add"
            id="product_form_${product.id}"
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
                  class="radiobuttons-group-wrapper form-group"
                  ?hidden=${option.name === 'Title' &&
                  option.values[0] === 'Default Title'}
                >
                  <h6>Choose a ${option.name}:</h6>
                  ${option.values.map(
                    (value) =>
                      html` <div
                        class="custom-control custom-radio option-value-radio-button"
                      >
                        <input
                          type="radio"
                          id="radio_${handleize(option.name)}_${handleize(
                            value
                          )}"
                          name=${option.name}
                          value=${value}
                          @change=${handleOptionChange}
                          class="custom-control-input"
                          ?checked=${currentVariant[
                            `option${option.position}`
                          ] === value}
                        />
                        <label
                          class="custom-control-label"
                          for="radio_${handleize(option.name)}_${handleize(
                            value
                          )}"
                          >${value}</label
                        >
                      </div>`
                  )}
                </div>`
            )}
            <div class="form-group">
              <input
                class="form-control quantity_input"
                name="quantity"
                type="number"
                value=${quantity}
                @change=${handleQuantityInputChange}
                min="0"
                step="1"
              />
            </div>
            <div class="error-description" ?hidden=${errorDescription === ''}>
              ${errorDescription}
            </div>
          </form>
        </div>
      </div>
      <div class="d-flex align-items-center bg-black">
        <div class="w-50">
          <button
            ?disabled=${!currentVariant || !currentVariant.available}
            @click=${handleATCButtonClick}
            type="submit"
            name="add"
            class="form-control AddToCart btn btn-${dataStyle}-filled-btn text-${dataStyle}-filled-btn-text"
          >
            <span class="AddToCartText"
              >${
                currentVariant && !currentVariant.available
                  ? html`Not Available`
                  : status === 'suspended'
                  ? html`Add To Cart`
                  : status === 'loading'
                  ? html`<span class="spinner-border"></span>`
                  : status === 'success'
                  ? html`Added`
                  : html``
              }</span
            >
          </button>
        </div>
        <div class="w-50 text-center bg-${
          dataStyle === 'light' ? 'black' : 'white'
        } text-${dataStyle === 'light' ? 'white' : 'black'}">
          ${formatMoney(currentVariant.price * quantity + extraPrice)}
        </div>
      </div>
      </div>
    </div>
  </div>`;
}

customElements.define(
  'collection-item-modal',
  component(collectionItemModal, {
    useShadowDOM: false,
    observedAttributes: [
      'data-product',
      'data-selected-or-first-available-variant',
      'data-options-with-values',
      'data-style',
      'data-extra-price',
    ],
  })
);
