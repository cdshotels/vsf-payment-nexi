// import * as types from "./store/mutation-types";
import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { module } from './store';
// import { beforeRegistration } from "./hooks/beforeRegistration";
// import EventBus from "@vue-storefront/core/compatibility/plugins/event-bus";
import { isServer } from '@vue-storefront/core/helpers';
// import { currentStoreView } from "@vue-storefront/core/lib/multistore";

export const PaymentNexiModule: StorefrontModule = function ({
  store,
  appConfig
}) {
  store.registerModule('nexi', module);

  const VSF_NEXI_CODE = 'vsfnexi';
  store.dispatch('checkout/addPaymentMethod', {
    title: 'Nexi',
    code: VSF_NEXI_CODE,
    cost: 0,
    costInclTax: 0,
    default: true,
    offline: false
  });

  if (!isServer) {
    // const storeView = currentStoreView();
    // const { currencyCode } = storeView.i18n;
    const merchantAlias = appConfig.nexi.merchantAlias;
    const nexiDomain =
      appConfig.nexi.env === 'production'
        ? 'ecommerce.nexi.it'
        : 'int-ecommerce.nexi.it';
    const sdkUrl = `https://${nexiDomain}/ecomm/XPayBuild/js?alias=${merchantAlias}`;

    var script = document.createElement('script');
    script.setAttribute('src', sdkUrl);
    document.head.appendChild(script);
  }
};
