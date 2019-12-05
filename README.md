# Nexi Payment module for Vue Storefront

Nexi Payment module for [vue-storefront](https://github.com/DivanteLtd/vue-storefront) by [CDSHotels](https://www.cdshotels.it).

![Demo](docs/demo.png)

## Installation

By hand (prefered):

```shell
$ git clone git@github.com:cdshotels/vsf-payment-nexi.git ./vue-storefront/src/modules/payment-nexi
```

```json
{
  ...,
  "nexi": {
    "env": "sandbox", // or production
    "merchantAlias": "YOUR_MERCHANT_ALIAS",
    "endpoint": {
      "configuration": "http://localhost:8080/api/ext/payment-nexi/configuration"
    }
  }
}
```

## Register the Nexi module

Open in your editor `./src/modules/client.ts`

```ts
...
import { PaymentCashOnDeliveryModule } from './payment-cash-on-delivery'
import { PaymentNexiModule } from './payment-nexi'

export function registerClientModules () {
  ...,
  registerModule(PaymentCashOnDeliveryModule)
  registerModule(PaymentNexiModule)
}
```

## Nexi payment Checkout Review

Under your theme `your-theme/components/core/blocks/Checkout/OrderReview.vue` add the following import to your script

```ts
import NexiDropIn from 'src/modules/payment-nexi/components/DropIn'

export default {
  components: {
    ...
    NexiDropIn
  },
  ...
  computed: {
    payment () {
      return this.$store.state.checkout.paymentDetails
    }
  },
```

And to you template add the nexi iframe before `button-full`:

```html
<nexi-drop-in v-if="payment.paymentMethod === 'vsfnexi'" />
<button-full
  @click.native="placeOrder"
  data-testid="orderReviewSubmit"
  class="place-order-btn"
  :disabled="$v.orderReview.$invalid"
>
  {{ $t('Place the order') }}
</button-full>
```

## Nexi payment API extension

Setup dependency to api:
`cd ../vue-storefront-api`
`yarn add -W @payment-nexi/checkout-server-sdk`

Install extension to `vue-storefront-api`:

```shell
$ cp -fr src/modules/paypal/api/paypal ../vue-storefront-api/src/api/extensions/
```

Go to api config  `./vue-storefront-api/config/local.json` (copy from existing `./vue-storefront-api/config/default.json` config file if it doesn't exist) and register the Nexi API extension:

```json
"registeredExtensions": [
    ...
    "nexi"
]
```

And add the `nexi` settings to `extensions` key:

Add the following also to your `config/local.json` need set `nexi.env` to `sandbox` or `prod`.

```json
  "extensions": {
    "nexi": {
      "env": "sandbox", // or production
      "clientId": "",
      "secret": ""
    },
    ...
  }
```
