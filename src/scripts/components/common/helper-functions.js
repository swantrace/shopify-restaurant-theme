import { addItemFromForm, getCart } from '../../ajaxapis';
import { dispatchCustomEvent } from '../../helper';

export function submitATCForm(e, setStatus, setErrorDescription) {
  const form = e.target.closest('form');
  if (form && form.id) {
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
}

export function changeCurrentVariant(
  e,
  optionsWithValues,
  product,
  setCurrentVariant
) {
  const form = e.target.closest('form');
  if (form) {
    e.preventDefault();
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
      detail: { currentVariant: cVariant },
    });
  }
}

export function changeQuantity(e, setQuantity) {
  const quantityInput = e.target;
  if (
    quantityInput &&
    !Number.isNaN(parseInt(quantityInput.value, 10)) &&
    parseInt(quantityInput.value, 10) >= 0
  ) {
    e.preventDefault();
    setQuantity(parseInt(quantityInput.value, 10));
  }
}

export function diffToLeftTime(initialDiff) {
  let diff = initialDiff;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  diff -= days * 24 * 60 * 60 * 1000;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  diff -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(diff / (60 * 1000));
  diff -= minutes * 60 * 1000;
  const seconds = Math.floor(diff / 1000);
  const milliseconds = diff - seconds * 1000;
  return { days, hours, minutes, seconds, milliseconds };
}

export default {
  submitATCForm,
  changeCurrentVariant,
  changeQuantity,
  diffToLeftTime,
};
