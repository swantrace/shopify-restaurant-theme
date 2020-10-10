/* eslint-disable no-nested-ternary */
import { html, component, useState, useLayoutEffect } from 'haunted';
import { addItemFromForm, getCart } from '../ajaxapis';
import { dispatchCustomEvent, formatMoney } from '../helper';

function atcRadiobuttonForm({
  dataProduct,
  dataSelectedOrFirstAvailableVariant,
  dataOptionsWithValues,
  selectorWrapperCustomClasses = '',
  selectorLabelCustomClasses = '',
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

  const [status, setStatus] = useState('suspended'); // there should be four kinds of status, suspended, loading, success, error
  const [errorDescription, setErrorDescription] = useState('');

  const handleOptionChange = () => {
    const form = this.closest('form');
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

  return html` <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">New message</h5>
      <button
        type="button"
        class="close"
        data-dismiss="modal"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form>
        <div class="form-group">
          <label for="recipient-name" class="col-form-label">Recipient:</label>
          <input type="text" class="form-control" id="recipient-name" />
        </div>
        <div class="form-group">
          <label for="message-text" class="col-form-label">Message:</label>
          <textarea class="form-control" id="message-text"></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">
        Close
      </button>
      <button type="button" class="btn btn-primary">Send message</button>
    </div>
  </div>`;
}

customElements.define(
  'atc-radiobutton-form',
  component(atcRadiobuttonForm, {
    useShadowDOM: false,
    observedAttributes: [
      'data-product',
      'data-selected-or-first-available-variant',
      'data-options-with-values',
      'selector-wrapper-custom-classes',
      'selector-label-custom-classes',
      'selector-custom-classes',
      'quantity-input-custom-classes',
      'atc-button-custom-classes',
    ],
  })
);
