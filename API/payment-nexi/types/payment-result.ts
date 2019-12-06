export type PaymentResult = {
  transactionCode: string;
  exit: string;
  currency: string;
  amount: number; // carefully, it's integer now, check if it works or use string
  date: string;
  hour: string;
  authorizationCode: string;
  mac: string;
};
