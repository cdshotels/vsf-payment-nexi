import { apiStatus } from '../../../lib/util';
import { Router } from 'express';
import crypto from 'crypto';

const ENVIRONMENTS = {
  TEST: 'TEST',
  COLL: 'COLL',
  INTEG: 'INTEG',
  PROD: 'PROD'
};

const LANGUAGES = {
  ITA: 'ITA',
  JPN: 'JPN',
  SPA: 'SPA',
  RUS: 'RUS',
  FRA: 'FRA',
  ARA: 'ARA',
  ENG: 'ENG',
  GER: 'GER',
  CHI: 'CHI',
  POR: 'POR'
};

module.exports = ({ config, db }) => {
  let api = Router();
  const env =
    config.extensions.paymentNexi.mode === 'production'
      ? ENVIRONMENTS.PROD
      : ENVIRONMENTS.INTEG;

  api.get('/configuration', (req, res) => {
    const currency = 'EUR';
    // const currency = req.query.currency | 'EUR';
    // TODO: get params from req.query and check if are present and correct !
    // const amount = req.query.amount;
    const amount = '4575'; // = 45.75 €
    const timestamp = new Date();
    const transactionId = `code_${Math.floor(timestamp / 1000)}`;

    const mac = crypto
      .createHash('sha1')
      .update(
        `codTrans=${transactionId}divisa=${currency}importo=${amount}${config.extensions.paymentNexi.apiSecret}`
      )
      .digest('hex');

    apiStatus(
      res,
      {
        configuration: {
          baseConfig: {
            apiKey: config.extensions.paymentNexi.apiKey,
            enviroment: env
          },
          paymentParams: {
            amount: amount,
            transactionId: transactionId,
            currency: currency,
            timeStamp: timestamp,
            mac: mac
          },
          customParams: {},
          language: LANGUAGES.ITA
        },
        status: 'success'
      },
      200
    );
  });

  return api;
};
