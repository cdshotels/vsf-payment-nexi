<template>
  <div />
</template>

<script>
/* global XPay */
/* eslint no-undef: "error" */

import { mapGetters } from 'vuex';
import store from '@vue-storefront/core/store';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';

export default {
  name: 'NexiPayment',
  data () {
    const storeView = currentStoreView();
    return {
      currencyCode: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale
    };
  },
  async mounted () {
    // do not await initLightbox, Nexi init freezes checkout UI
    this.initLightbox();
    window.addEventListener('XPay_Payment_Result', this.onPaymentResult);
  },
  beforeDestroy () {
    window.removeEventListener('XPay_Payment_Result', this.onPaymentResult);
  },
  computed: {
    ...mapGetters({ cartTotals: 'cart/getTotals' }),
    grandTotal () {
      return this.cartTotals.find((seg) => seg.code === 'grand_total').value;
    }
  },
  watch: {
    async grandTotal (total) {
      await this.refreshLightbox();
    }
  },
  methods: {
    async getPaymentConfiguration () {
      const configuration = await store.dispatch('nexi/configuration', {
        grandTotal: this.grandTotal,
        currencyCode: this.currencyCode,
        locale: this.locale
      });
      return configuration;
    },
    async initLightbox () {
      // TODO: ensure that Nexi SDK is loaded before XPay.init();
      try {
        XPay.init();

        const resp = await this.getPaymentConfiguration();
        if (resp.code === 200) {
          console.debug('Nexi configuration:' + resp);

          XPay.initLightbox(resp.result.configuration);

          var button = document.querySelector('.place-order-btn');
          if (button) {
            button.addEventListener('click', () => this.onOrderConfirmed());
          } else {
            console.err(
              'Confirm order button with class .place-order-btn was not found'
            );
          }
        } else {
          console.error(resp);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async refreshLightbox () {
      try {
        const resp = await this.getPaymentConfiguration();
        if (resp.code === 200) {
          console.debug('Nexi configuration:' + resp);

          XPay.initLightbox(resp.result.configuration);
        } else {
          console.err(resp);
        }
      } catch (e) {
        console.error(e);
      }
    },
    onOrderConfirmed () {
      XPay.openLightbox();
    },
    async onPaymentResult (e) {
      // handle response
      if (e && e.detail && e.detail.esito === 'OK') {
        console.debug('success');
        // console.debug(e.detail);

        // add payment result to order model and confirm order
        EventBus.$emit('checkout-do-placeOrder', e.detail);
      } else {
        await this.onPaymentError(e);
      }
      XPay.closeLightbox();
    },
    async onPaymentError (e) {
      if (!e || !e.detail) {
        console.error('Incorrect Nexi payment response', e);
      }

      EventBus.$emit('payment-nexi-cancelled', e);

      await this.showNotification(e);
      await this.refreshLightbox();
    },
    async showNotification (e) {
      if (!e || !e.detail || e.detail.esito === 'ANNULLO') {
        return; // do not show any notification, user cancelled the payment operation
      }

      console.error(e.detail);

      await store.dispatch(
        'notification/spawnNotification',
        {
          type: 'error',
          message: this.prepareErrorNotification(e.detail),
          action1: { label: this.$t('OK') },
          hasNoTimeout: true
        },
        { root: true }
      );
    },
    prepareErrorNotification (nexiResponse) {
      // error messages are taken from nexi, they do not have much sense

      // because Nexi error handling sux and no user friendly messages are being returned
      // (mix of english and italian phrases abbreviated),
      // we have to prepare custom error messages based on error code

      // prepare default error message
      let errorMessage = this.$t(
        'An error occurred while processing the payment.'
      );

      if (nexiResponse.codiceEsito) {
        errorMessage += ` ${this.$t('Reason:')} `;

        switch (nexiResponse.codiceEsito) {
          case '103':
            errorMessage += this.$t('Authorization denied by the card issuer.');
            break;

          case '116':
            const trans = (nexiResponse.tipoTransazione || '')
              .trim()
              .toLowerCase();
            if (trans === 'no_3dsecure') {
              errorMessage += this.$t(
                'Your card is not enrolled for 3D Secure. This means that either the bank that issued the card is not yet supporting 3D Secure or it means that the card holder has not yet been registered for the service.'
              );
            } else {
              errorMessage += this.$t('3D Secure canceled by user.');
            }
            break;

          case '117':
            errorMessage += this.$t(
              'Unauthorized card due to BIN Table application rules.'
            );
            break;

          case '119':
            errorMessage += this.$t(
              'Operator not authorized to operate in this mode.'
            );
            break;

          case '120':
            errorMessage += this.$t(
              'Circuit is not accepted, in the request message was indicated to accept payment with a circuit while the card pan is on another circuit.'
            );
            break;

          case '400':
            errorMessage += this.$t('Authorization denied');
            break;

          case '401':
            errorMessage += this.$t('Card expired');
            break;

          case '402':
            errorMessage += this.$t('Card restricted');
            break;

          case '403':
            errorMessage += this.$t('Invalid merchant');
            break;

          case '404':
            errorMessage += this.$t('Transaction not permited');
            break;

          case '405':
            errorMessage += this.$t('Your card has insufficient funds');
            break;

          case '666':
            errorMessage += this.$t(
              'An error occurred while saving the payment information'
            );
            break;
        }
        errorMessage += ` (CODE: ${nexiResponse.codiceEsito})`;
      }

      return errorMessage;
    }
  }
};
</script>
