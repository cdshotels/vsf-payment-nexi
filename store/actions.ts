import { NexiState } from '../types/NexiState';
import { ActionTree } from 'vuex';
import config from 'config';
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore';

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<NexiState, any> = {
  configuration(_, params) {
    // TODO: implement, it's just a copy paste right now
    let url = config.nexi.endpoint.configuration;
    url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url;
    return fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    }).then((resp) => {
      return resp.json();
    });
  }
};
