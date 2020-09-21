import {
  html,
  component,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from 'haunted';
import { useDebouncedCallback } from './custom-hooks';
import { getPredictiveSearchResults } from '../ajaxapis';

function predictiveSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState({
    articles: [],
    collections: [],
    pages: [],
    products: [],
  });

  const debounced = useDebouncedCallback((q) => {
    if (q.length > 0) {
      getPredictiveSearchResults(q).then(function (response) {
        const {
          resources: { results },
        } = response;
        setResults(results);
      });
    }
  }, 1000);

  const handleKeyup = (event) => {
    setQ(event.target.value);
    debounced.callback(event.target.value);
  };

  return html`
    <h1>Search</h1>
    <input type="text" @keyup=${handleKeyup} value=${q} />
    <div>${JSON.stringify(results)}</div>
  `;
}

customElements.define('predictive-search', component(predictiveSearch));
