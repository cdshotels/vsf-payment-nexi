// import * as types from './store/mutation-types';
import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { module } from './store';
// import { beforeRegistration } from "./hooks/beforeRegistration";
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { isServer } from '@vue-storefront/core/helpers';
// import { currentStoreView } from '@vue-storefront/core/lib/multistore';

export const PaymentNexiModule: StorefrontModule = function({
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
    debugger;
    const merchantAlias = appConfig.nexi.merchantAlias;
    const nexiDomain =
      appConfig.nexi.env === 'production'
        ? 'ecommerce.nexi.it'
        : 'int-ecommerce.nexi.it';
    const sdkUrl = `https://${nexiDomain}/ecomm/XPayBuild/js?alias=${merchantAlias}`;

    var script = document.createElement('script');
    script.setAttribute('src', sdkUrl);
    document.head.appendChild(script);

    let isCurrentPaymentMethod = false;
    // EventBus.$on('checkout-payment-method-changed', (paymentMethodCode) => {
    //   isCurrentPaymentMethod = paymentMethodCode === VSF_NEXI_CODE
    // })
    // store.watch((state) => state.checkout.paymentDetails.paymentMethod, (prevMethodCode, newMethodCode) => {
    //   isCurrentPaymentMethod = newMethodCode === VSF_NEXI_CODE
    // })
    // store.watch((state) => state.checkout.paymentDetails, (prevMethodCode, newMethodCode) => {
    //   isCurrentPaymentMethod = newMethodCode.paymentMethod === VSF_NEXI_CODE
    // })
    const invokePlaceOrder = () => {
      if (isCurrentPaymentMethod) {
        // WHY ? it should be an event on Confirm Order button press and emit do-placeOrder after payment, isn't it?
        // EventBus.$emit('checkout-do-placeOrder', {})
      }
    };
    EventBus.$on('checkout-before-placeOrder', invokePlaceOrder);

    EventBus.$on('checkout-payment-method-changed', (paymentMethodCode) => {
      let methods = store.state['payment-backend-methods'].methods;
      if (
        paymentMethodCode === VSF_NEXI_CODE &&
        methods !== null &&
        methods.find(
          (item) =>
            item.code === paymentMethodCode && item.is_server_method === true
        )
      ) {
        isCurrentPaymentMethod = true;
      } else {
        isCurrentPaymentMethod = false;
      }
    });
  }
};
