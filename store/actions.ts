import { NexiState } from '../types/NexiState';
import { ActionTree } from 'vuex';
import config from 'config';
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore';

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<NexiState, any> = {
  async configuration (_, { grandTotal, currencyCode, locale }) {
    let url = `${config.nexi.endpoint.configuration}?amount=${grandTotal}&currencyCode=${currencyCode}&locale=${locale}`;
    url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url;

    const resp = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    });

    return resp.json();
  }
};
