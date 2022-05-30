import inquirer from 'inquirer';
import {
  PrivateKey,
  AccountCreateTransaction,
  AccountDeleteTransaction,
  Hbar
} from '@hashgraph/sdk';

class Account {
  client = null;
  environment = null;

  constructor(client, environment) {
    this.client = client;
    this.environment = environment;
  }

  _create(default_amount) {
    return new Promise(async(resolve, reject) => {
      try {
        // Create new account keys...
        const privateKey = await PrivateKey.generate(); 
        const publicKey = privateKey.publicKey;

        // Create a new account...
        const transaction = await new AccountCreateTransaction()
            .setKey(publicKey)
            .setInitialBalance(new Hbar(default_amount))
            .execute(this.client);

        // Get the receipt...
        const getReceipt = await transaction.getReceipt(this.client);

        resolve({
          accountId: getReceipt.accountId.toString(),
          publicKey: publicKey.toString(),
          privateKey: privateKey.toString()
        })
      } catch(error) {
        reject(error);
      }
    });
  }


  create() {
    return new Promise(async(resolve, reject) => {
      inquirer.prompt([
        {
          type: 'list',
          name: 'actions',
          message: 'Do you want to create a treasury account, or to use an existing one?',
          choices: [
            'Create a new one', 
            'Use an existing one',
          ],
        },
        {
          type: 'input',
          name: 'default_amount',
          message: 'How many hbar you want to top up this wallet with?',
          default: 0,
          when: (answers) => answers.actions == 'Create a new one',
        }         
      ]).then(async(answers) => {
        switch(answers.actions) {
          case 'Create a new one':
            try {
              let treasury = await this._create(answers.default_amount);
              resolve(treasury);
            } catch(error) {
              reject(error);
            }
            break;
          case 'Use an existing one':
            inquirer.prompt([
              {
                type: 'input',
                name: 'id',
                message: "What's the treasury's ID?"
              }, 
              {
                type: 'input',
                name: 'privateKey',
                message: "What's the treasury's private key?"
              },             
            ]).then(async(treasury) => {
              const privateKey = await PrivateKey.fromString(treasury.privateKey);
              
              resolve({
                accountId: treasury.id,
                publicKey: privateKey.publicKey.toString(),
                privateKey: treasury.privateKey
              })
            });          
            break;
        }
      });
    });
  }  

  delete(tokenSecrets, accountId, privateKey) {
    return new Promise(async(resolve, reject) => {
      inquirer.prompt([
        {
          type: 'input',
          name: 'accountId',
          message: `Which is the account you want to delete?`,
          default: accountId
        },
        {
          type: 'input',
          name: 'privateKey',
          message: `Which is the account private key?`,
          default: privateKey
        }
      ]).then(async(answers) => {
        try {
          // Delete an account, and take balance into main treasury...
          const transaction = await new AccountDeleteTransaction()
              .setAccountId(answers.accountId)
              .setTransferAccountId(tokenSecrets.treasury.accountId)
              .freezeWith(this.client);
  
          const signTx = await transaction.sign(PrivateKey.fromString(answers.privateKey));
          const txResponse = await signTx.execute(this.client);
          const receipt = await txResponse.getReceipt(this.client);
          resolve(receipt.status.toString());
        } catch(error) {
          reject(error);
        }
      });
    });
  }
}

export default Account