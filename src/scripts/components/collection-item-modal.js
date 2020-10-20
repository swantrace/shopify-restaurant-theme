/* eslint-disable no-nested-ternary */
import { html, component, useState } from 'haunted';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { addItemFromForm, getCart } from '../ajaxapis';
import { dispatchCustomEvent, formatMoney, handleize } from '../helper';
import tagimages from '../tagimages';

function collectionItemModal({
  dataProduct,
  dataSelectedOrFirstAvailableVariant,
  dataOptionsWithValues,
  dataExtraPrice,
  dataStyle = 'light',
}) {
  const product = JSON.parse(dataProduct);
  const optionsWithValues = JSON.parse(dataOptionsWithValues);
  const extraPrice = Number.isNaN(Number(dataExtraPrice))
    ? 0
    : parseInt(Number(dataExtraPrice), 10);
  const [currentVariant, setCurrentVariant] = useState(
    product.variants.find(
      (variant) =>
        variant.id === parseInt(dataSelectedOrFirstAvailableVariant, 10)
    )
  );
  const [quantity, setQuantity] = useState(1);

  const [status, setStatus] = useState('suspended'); // there should be four kinds of status, suspended, loading, success, error
  const [errorDescription, setErrorDescription] = useState('');

  const handleFormChange = (e) => {
    if (e.target.name === 'quantity') {
      const quantityInput = e.target;
      setQuantity(quantityInput.value);
    } else {
      const form = e.target.closest('form');
      let option1 = null;
      let option2 = null;
      let option3 = null;
      optionsWithValues.forEach((option) => {
        if (option.position === 1) {
          option1 = form[option.name].value;
        }
        if (option.position === 2) {
          option2 = form[option.name].value;
        }
        if (option.position === 3) {
          option3 = form[option.name].value;
        }
      });

      const cVariant = product.variants.find(
        (variant) =>
          variant.option1 === option1 &&
          variant.option2 === option2 &&
          variant.option3 === option3
      );

      setCurrentVariant(cVariant);

      dispatchCustomEvent(form, 'variantchanged', {
        bubbles: true,
        composed: true,
        detail: { currentVariant: cVariant, formatMoney },
      });
    }
  };

  const handleATCButtonClick = (e) => {
    const form =
      e.target.closest('collection-item-modal') &&
      e.target.closest('collection-item-modal').querySelector('form');
    if (form.id) {
      e.preventDefault();
      setStatus('loading');
      addItemFromForm(form).then((addedItem) => {
        if (addedItem.id) {
          setStatus('success');
          getCart().then((cart) => {
            dispatchCustomEvent(form, 'cartupdated', {
              bubbles: true,
              composed: true,
              detail: { cart },
            });
          });
          setTimeout(() => {
            setStatus('suspended');
            dispatchCustomEvent(form, 'modaladdtocartfinished', {
              bubbles: true,
              composed: true,
              detail: { form },
            });
          }, 1000);
        }

        if (addedItem.description) {
          setStatus('error');
          setErrorDescription(addedItem.description);
          setTimeout(() => {
            setErrorDescription('');
            setStatus('suspended');
          }, 1000);
        }
      });
    }
  };

  return html`<div class="modal-dialog collection-item-modal">
    <div class="modal-content collection-item-modal-inner">
      <img
        class="img-fluid collection-item-modal-image"
        src=${product.featured_image}
      />
      <i class="fas fa-times modal-close-icon" data-dismiss="modal" style="
          position: absolute;
          top: 0;
          right: 0;
          font-size: 30px;
          cursor: pointer;
      "></i>
      <div class="modal-body">
        <div class="collection-item-modal-info">
          <h5 class="collection-item-modal-title">${product.title}</h5>
          <div class="collection-item-modal-description">
            ${unsafeHTML(product.description)}
          </div>
          <div class="collection-item-modal-tags">
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
            @change=${handleFormChange}
          >
            <input type="hidden" name="form_type" value="product" />
            <input type="hidden" name="utf8" value="✓" />
            <input
              name="id"
              value="${currentVariant && currentVariant.id}"
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
                value="${quantity}"
                step="1"
              />
            </div>
            <div class="bold_options"></div>
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
            class="form-control AddToCart btn btn-black"
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
        <div class="w-50 text-center text-white">
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
