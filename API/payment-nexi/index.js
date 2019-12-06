import { apiStatus, apiError } from '../../../lib/util';
import { Router } from 'express';
import { NexiClient } from './nexi-client';

module.exports = ({ config }) => {
  let api = Router();

  api.get('/configuration', (req, res) => {
    if (!req.query.amount || isNaN(req.query.amount)) {
      return apiError(
        res,
        new Error("Missing required query parameter 'amount' in number format")
      );
    }
    if (!req.query.currencyCode) {
      return apiError(
        res,
        new Error("Missing required query parameter 'currencyCode'")
      );
    }
    if (!req.query.locale) {
      return apiError(
        res,
        new Error("Missing required query parameter 'locale'")
      );
    }

    const nexiClient = new NexiClient(config.extensions.paymentNexi);

    const currency = nexiClient.getCurrency(req.query.currencyCode);
    const language = nexiClient.getLanguage(req.query.locale);
    const amount = req.query.amount;

    const paymentConfiguration = nexiClient.getPaymentConfiguration(
      language,
      currency,
      amount
    );

    apiStatus(
      res,
      {
        configuration: paymentConfiguration,
        status: 'success'
      },
      200
    );
  });

  return api;
};
