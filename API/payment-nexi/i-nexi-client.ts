import { Currency } from './types/currency';
import { PaymentConfiguration } from './types/payment-configuration';
import { Language } from './types/language';
import { PaymentResult } from './types/payment-result';

export interface INexiClient {
  /**
   * Function converts language code to Nexi format.
   * @param isoLocale Language code with ISO 639-1 and 3166-1 standard, e.g. 'en' or 'en-US'
   */
  getLanguage(isoLocale: string): Language;

  /**
   * Function converts currency to Nexi format.
   * @param currency
   */
  getCurrency(currency: string): Currency;

  /**
   * Prepares Nexi payment configuration with unique transaction code and encrypted mac.
   * @param currency Currency enume type.
   * @param amount Amount to be paid.
   * @param secret Nexi secret key.
   */
  getPaymentConfiguration(
    language: Language,
    currency: Currency,
    amount: number
  ): PaymentConfiguration;

  /**
   * Creates hash based on transaction code, currency, amount to pay and secret key
   * @param transactionCode Unique transaction code.
   * @param currency Currency enume type.
   * @param amount Amount to be paid.
   */
  createHashMac(
    transactionCode: string,
    currency: Currency,
    amount: number
  ): string;

  /**
   * Validates payment response from nexi.
   * @param result Payment response from nexi.
   */
  isPaymentValid(result: PaymentResult): boolean;
}
