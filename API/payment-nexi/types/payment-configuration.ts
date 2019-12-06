import { Currency } from './currency';
import { Language } from './language';
import { Environment } from './environment';

export type PaymentConfiguration = {
  baseConfig: {
    apiKey: string;
    enviroment: Environment;
  };
  paymentParams: {
    amount: string;
    transactionId: string;
    currency: Currency;
    timeStamp: string;
    mac: string;
  };
  customParams: {};
  language: Language;
};
