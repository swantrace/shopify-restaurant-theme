import { html, component, useState } from 'haunted';

function addToCartFormInputs({
  dataProduct,
  dataSelectedOrFirstAvailableVariant,
  dataOptionsWithValues,
  selectorCustomClasses = '',
  quantityInputCustomClasses = '',
  atcButtonCustomClasses = '',
}) {
  const product = JSON.parse(dataProduct);
  const optionsWithValues = JSON.parse(dataOptionsWithValues);
  const [currentVariant, setCurrentVariant] = useState(
    product.variants.find(
      (variant) =>
        variant.id === parseInt(dataSelectedOrFirstAvailableVariant, 10)
    )
  );

  const handleOptionChange = () => {
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

    // dispatch a custom event to connect to other codes
    const event = new CustomEvent('variantchange', {
      bubbles: true,
      composed: true,
      detail: { currentVariant: cVariant, form: this.closest('form') },
    });
    this.dispatchEvent(event);
  };

  const handleATCButtonClick = (e) => {
    const event = new CustomEvent('additemfromform', {
      bubbles: true,
      composed: true,
      detail: { originalEvent: e, form: this.closest('form') },
    });
    this.dispatchEvent(event);
  };

  return html`<input
      name="id"
      value="${currentVariant && currentVariant.id}"
      type="hidden"
    />
    ${optionsWithValues.map(
      (option) =>
        html`<div
          class="selector-wrapper"
          ?hidden=${option.name === 'Title' &&
          option.values[0] === 'Default Title'}
        >
          <select
            data-option="option${option.position}"
            @change=${handleOptionChange}
            class="form-control ${selectorCustomClasses}"
          >
            ${option.values.map(
              (value) =>
                html`<option
                  ?selected=${currentVariant &&
                  currentVariant[`option${option.position}`] === value}
                  value="${value}"
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
    <button
      ?disabled=${!currentVariant || !currentVariant.available}
      @click=${handleATCButtonClick}
      type="submit"
      name="add"
      class="form-control AddToCart btn ${atcButtonCustomClasses}"
    >
      <span class="AddToCartText">Add to Cart</span>
    </button>`;
}

customElements.define(
  'add-to-cart-form-inputs',
  component(addToCartFormInputs, {
    useShadowDOM: false,
    observedAttributes: [
      'data-product',
      'data-selected-or-first-available-variant',
      'data-options-with-values',
      'selector-custom-classes',
      'quantity-input-custom-classes',
      'atc-button-custom-classes',
    ],
  })
);
