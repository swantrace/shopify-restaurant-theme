/* eslint-disable no-nested-ternary */
import { html, component, useState } from 'haunted';
import { addItemFromForm, getCart } from '../ajaxapis';
import { dispatchCustomEvent, formatMoney } from '../helper';

function atcDropdownInputs({
  dataProduct,
  dataSelectedOrFirstAvailableVariant,
  dataOptionsWithValues,
  selectorWrapperCustomClasses = '',
  selectorLabelCustomClasses = '',
  selectorCustomClasses = '',
  quantityInputCustomClasses = '',
  atcButtonCustomClasses = '',
  dataStyle = 'dark',
}) {
  const product = JSON.parse(dataProduct);
  const optionsWithValues = JSON.parse(dataOptionsWithValues);
  const [currentVariant, setCurrentVariant] = useState(
    product.variants.find(
      (variant) =>
        variant.id === parseInt(dataSelectedOrFirstAvailableVariant, 10)
    )
  );
  const [status, setStatus] = useState('suspended'); // there should be four kinds of status, suspended, loading, success, error
  const [errorDescription, setErrorDescription] = useState('');

  const handleOptionChange = (e) => {
    const form = e.target.closest('form');
    const option1 =
      this.querySelector('select[data-option="option1"]') &&
      this.querySelector('select[data-option="option1"]').value;
    const option2 =
      this.querySelector('select[data-option="option2"]') &&
      this.querySelector('select[data-option="option2"]').value;
    const option3 =
      this.querySelector('select[data-option="option3"]') &&
      this.querySelector('select[data-option="option3"]').value;
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
  };

  const handleATCButtonClick = (e) => {
    if (this.closest('form').id) {
      e.preventDefault();
      const form = this.closest('form');
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

  return html`<input
      name="id"
      value="${currentVariant && currentVariant.id}"
      type="hidden"
    />
    ${optionsWithValues.map(
      (option) =>
        html`<div
          class="selector-wrapper form-group ${selectorWrapperCustomClasses}"
          ?hidden=${option.name === 'Title' &&
          option.values[0] === 'Default Title'}
        >
          <label class="${selectorLabelCustomClasses}" for="${option.name}"
            >${option.name}:</label
          >
          <select
            id="${option.name}"
            data-option="option${option.position}"
            @change=${handleOptionChange}
            class="form-control ${selectorCustomClasses}"
          >
            ${option.values.map(
              (value) =>
                html`<option
                  class="text text-${dataStyle}-text"
                  value="${value}"
                  ?selected=${currentVariant &&
                  currentVariant[`option${option.position}`] === value}
                >
                  ${value}
                </option>`
            )}
          </select>
        </div>`
    )}
    <input
      class="form-control quantity_input ${quantityInputCustomClasses}"
      name="quantity"
      type="number"
      value="1"
      step="1"
    />
    <div class="d-flex justify-content-between">
      <button
        ?disabled=${!currentVariant || !currentVariant.available}
        @click=${handleATCButtonClick}
        type="submit"
        name="add"
        class="form-control AddToCart btn ${atcButtonCustomClasses} col col-lg-3"
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
      <div class="btn-group align-self-center h-100" role="group">
        <button class="detail-icon btn btn-primary p-0 pr-3" type="button">
          <i class="fa fa-list pr-2"></i>Detail
        </button>
        <button class="share-icon btn btn-primary p-0" type="button">
          <i class="fa fa-share-alt pr-2"></i>Share
        </button>
      </div>
    </div>
    <div class="error-description" ?hidden=${errorDescription === ''}>
      ${errorDescription}
    </div>`;
}

customElements.define(
  'atc-dropdown-inputs',
  component(atcDropdownInputs, {
    useShadowDOM: false,
    observedAttributes: [
      'data-product',
      'data-selected-or-first-available-variant',
      'data-options-with-values',
      'data-style',
      'quantity-input-custom-classes',
      'atc-button-custom-classes',
    ],
  })
);
