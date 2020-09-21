import { html, component, useState } from 'haunted';
import { useDebouncedCallback } from './custom-hooks';
import { getPredictiveSearchResults } from '../ajaxapis';

function predictiveSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const debounced = useDebouncedCallback(() => {
    getPredictiveSearchResults(q).then(function setValue(response) {
      setLoading(false);
      if (response.message) {
        setResults({});
      } else {
        setResults(response.resources.results);
      }
    });
  }, 500);

  const handleKeyup = (event) => {
    setLoading(true);
    setQ(event.target.value);
    debounced.callback(event.target.value);
  };

  return html`
    <h1>${`${loading ? 'loading...' : 'loaded'}`}</h1>
    <input type="text" @keyup=${handleKeyup} value=${q} />
    <div>${JSON.stringify(results)}</div>
  `;
}

customElements.define(
  'predictive-search',
  component(predictiveSearch, { useShadowDOM: false })
);
