import crypto from 'crypto';
import { Currency } from './types/currency';
import { INexiClient } from './i-nexi-client';
import { PaymentConfiguration } from './types/payment-configuration';
import { NexiConfiguration } from './types/nexi-configuration';
import { Environment } from './types/environment';
import { Language } from './types/language';
import { PaymentResult } from './types/payment-result';

class NexiClient implements INexiClient {
  private config: NexiConfiguration;

  constructor(config: NexiConfiguration) {
    if (!config) {
      throw new Error('Missing parameter config with nexi configuration');
    }
    if (
      !config.apiKey ||
      !config.apiSecret ||
      !config.env ||
      !config.defaultCurrency ||
      !config.defaultLanguage
    ) {
      throw new Error(
        'Incorrect nexi configuration: apiKey, apiSecret, env, defaultCurrency and defaultLanguage are required parameters'
      );
    }
    if (!Language[config.defaultLanguage]) {
      const allowedValues = Object.values(Language)
        .filter((x) => typeof x === 'string')
        .join(',');
      throw new Error(
        `Incorrect nexi configuration: defaultLanguage '${config.defaultLanguage}' was not found in Language enumeration: [${allowedValues}]`
      );
    }
    if (!Currency[config.defaultCurrency]) {
      const allowedValues = Object.values(Currency)
        .filter((x) => typeof x === 'string')
        .join(',');
      throw new Error(
        `Incorrect nexi configuration: defaultCurrency '${config.defaultCurrency}' was not found in Currency enumeration: [${allowedValues}]`
      );
    }
    this.config = config;
  }

  /**
   * Function converts language code to Nexi format.
   * @param isoLocale Language code with ISO 639-1 and 3166-1 standard, e.g. 'en' or 'en-US'
   */
  getLanguage(isoLocale: string): Language {
    // ISO locale 639-1 'en-US' change to 'en'
    let locale = (isoLocale || '').toLowerCase();
    locale = locale.length > 2 ? locale.substring(0, 2) : locale;

    switch (locale) {
      case 'it':
        return Language.ITA;
      case 'ja':
        return Language.JPN;
      case 'es':
        return Language.SPA;
      case 'ru':
        return Language.RUS;
      case 'fr':
        return Language.FRA;
      case 'de':
        return Language.GER;
      case 'cn':
        return Language.CHI;
      case 'pt':
        return Language.POR;
      case 'en':
        return Language.ENG;

      default:
        return Language[this.config.defaultLanguage];
    }
  }

  /**
   * Function converts currency to Nexi format.
   * @param currency
   */
  getCurrency(currency: string): Currency {
    const curr = Currency[currency];
    return curr ? curr : Currency[this.config.defaultLanguage];
  }

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
  ): PaymentConfiguration {
    const env =
      this.config.env === 'production'
        ? Environment.Production
        : Environment.Integ;

    const timestamp = new Date();
    const transactionId = `code_${Math.floor(+timestamp / 1000)}`;

    // nexi requires payment in a format: 40.25 € => 4025
    const nexiAmount = this.convertNumberToBankFormat(amount);

    const mac = this.createHashMac(transactionId, currency, nexiAmount);
    return {
      baseConfig: {
        apiKey: this.config.apiKey,
        enviroment: env
      },
      paymentParams: {
        amount: nexiAmount.toString(),
        transactionId: transactionId,
        currency: currency,
        timeStamp: (+timestamp).toString(),
        mac: mac
      },
      customParams: {},
      language: language
    };
  }

  /**
   * Creates hash based on transaction code, currency, amount to pay and secret key
   * @param transactionCode Unique transaction code.
   * @param currency Currency enum type.
   * @param nexiAmount Amount to be paid in nexi format, e.g. 4025 for 40.25 €.
   */
  createHashMac(
    transactionCode: string,
    currency: Currency,
    nexiAmount: number
  ): string {
    const secret = this.config.apiSecret;

    return crypto
      .createHash('sha1')
      .update(
        `codTrans=${transactionCode}divisa=${currency}importo=${nexiAmount}${secret}`
      )
      .digest('hex');
  }

  isPaymentValid(result: PaymentResult): boolean {
    const resultHash = this.createResultHashMac(
      result.transactionCode,
      result.exit,
      result.currency,
      result.amount,
      result.date,
      result.hour,
      result.authorizationCode
    );

    return result.mac === resultHash;
  }

  /**
   * Converts number to nexi format. Example 40.25 € converts to 4025.
   * @param num
   */
  private convertNumberToBankFormat(num: number): number {
    return Math.round(num * 100);
  }

  /**
   * Creates hash based on payment result model.
   * @param transactionCode Transaction code.
   * @param exit Exit code.
   * @param currency Currency.
   * @param amount Paid amount.
   * @param date Date of payment.
   * @param hour Hour of payment.
   * @param authorizationCode Authorization code.
   */
  private createResultHashMac(
    transactionCode: string,
    exit: string,
    currency: string,
    amount: number,
    date: string,
    hour: string,
    authorizationCode: string
  ): string {
    const secret = this.config.apiSecret;

    return crypto
      .createHash('sha1')
      .update(
        `codTrans=${transactionCode}esito=${exit}importo=${amount}divisa=${currency}data=${date}orario=${hour}codAut=${authorizationCode}${secret}`
      )
      .digest('hex');
  }
}

export { NexiClient };
