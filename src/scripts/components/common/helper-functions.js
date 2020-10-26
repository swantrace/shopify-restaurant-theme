import { addItemFromForm, getCart } from '../../ajaxapis';
import { dispatchCustomEvent } from '../../helper';

export function submitATCForm(form, setStatus, setErrorDescription) {
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

export default { submitATCForm };
