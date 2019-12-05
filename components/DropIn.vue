<template>
  <div />
</template>

<script>
import { mapGetters } from 'vuex';
import store from '@vue-storefront/core/store';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';

export default {
  name: 'NexiPayment',
  data() {
    const storeView = currentStoreView();
    return {
      currencyCode: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale
    };
  },
  async mounted() {
    // do not await initLightbox, Nexi init freezes checkout UI
    this.initLightbox();
    window.addEventListener('XPay_Payment_Result', this.paymentCallback);
  },
  beforeDestroy() {
    window.removeEventListener('XPay_Payment_Result', this.paymentCallback);
  },
  computed: {
    ...mapGetters({ cartTotals: 'cart/getTotals' }),
    grandTotal() {
      return this.cartTotals.find((seg) => seg.code === 'grand_total').value;
    }
  },
  methods: {
    async initLightbox() {
      // TODO: ensure that Nexi SDK is loaded before XPay.init();
      XPay.init();

      return store
        .dispatch('nexi/configuration')
        .then((resp) => {
          if (resp.code === 200) {
            console.debug('Nexi configuration:' + resp);

            XPay.initLightbox(resp.result.configuration);

            var button = document.querySelector('.place-order-btn');
            if (button) {
              button.addEventListener('click', () => this.pay());
            } else {
              console.err(
                'Confirm order button with class .place-order-btn was not found'
              );
            }
          } else {
            console.err(resp);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    pay() {
      XPay.openLightbox();
    },
    paymentCallback(e) {
      if (e && e.detail) {
        // handle response

        if (e.detail.esito === 'OK') {
          console.debug('success');
          // console.debug(e.detail);

          // add payment result to order model and confirm order
          EventBus.$emit('checkout-do-placeOrder', e.detail);
        } else {
          // TODO: handle nexi error codes and show error message
          // TODO: refresh Nexi button (second operation with the same configuration and transaction ID fails to open lightbox)
          console.error(e.detail);
          EventBus.$emit('payment-nexi-cancelled', e);
        }
      } else {
        // TODO: refresh Nexi button (second operation with the same configuration and transaction ID fails to open lightbox)
        console.error('Incorrect Nexi payment response', e);
        EventBus.$emit('payment-nexi-cancelled', e);
      }
      XPay.closeLightbox();
    }
  }
};
</script>
