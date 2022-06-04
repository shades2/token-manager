import { Client } from '@hashgraph/sdk';

import Token from './token.js';
import Account from './account.js';
import ICO from './ico.js';

import dotenv from 'dotenv';
dotenv.config();

class Api {
  account = null;
  token = null;
  ico = null;
  client = null;

  constructor() {}

  initClient(environment) {
    switch(environment) {
      case 'testnet':
        this.client = Client.forTestnet();
        this.client.setOperator(
          process.env.DEV_OPERATOR_ACCOUNT, 
          process.env.DEV_OPERATOR_PRIVATE_KEY
        );
        break;
      case 'mainnet':
        this.client = Client.forMainnet();
        this.client.setOperator(
          process.env.PROD_OPERATOR_ACCOUNT, 
          process.env.PROD_OPERATOR_PRIVATE_KEY          
        );
    }

    this.account = new Account(this.client, environment);
    this.token = new Token(this.client, environment);
    this.ico = new ICO(this.client, environment);
  }
}

export default Api