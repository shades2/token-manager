import moment from 'moment';
import inquirer from 'inquirer';
import inquirerDatePrompt from 'inquirer-date-prompt';
inquirer.registerPrompt("date", inquirerDatePrompt);

import TokenICO from '../io/tokenICO.js';
import TokenAdministrate from '../token/administrate.js';
import Account from '../../api/account.js';

class CreateICO {
  client = null;
  environment = null;
  rounds = null;
  tokenAdministrate = null;
  accountAPI = null;

  constructor(client, environment) {
    this.client = client;
    this.environment = environment;

    this.tokenAdministrate = new TokenAdministrate(this.client, this.environment);
    this.accountAPI = new Account(this.client, this.environment);
    this.tokenICO = new TokenICO();
  }

  create(tokenSecrets) {
    return new Promise(async (resolve, reject) => {
      let icos = await this.tokenICO.readICO();
      let tokenICO = icos.find(ico => ico.id == tokenSecrets.id);

      if (tokenICO) {
        resolve(`ICO already exists for ${tokenSecrets.name}, please use the update function.`);
      } else {
        inquirer.prompt([
          {
            type: 'date',
            name: 'start',
            message: `When do you want to start your ICO for ${tokenSecrets.name}?`
          },
          {
            type: 'input',
            name: 'rounds',
            message: `How many rounds do you want to have in your ICO for ${tokenSecrets.name}?`
          }
        ]).then(async (answers) => {
          let ico = {
            id: tokenSecrets.id,
            environment: tokenSecrets.environment,
            start: answers.start,
            rounds: []
          };

          let start = moment(answers.start);
          inquirer.prompt([
            {
              type: 'confirm',
              name: 'pause',
              message: `Do you want to pause ${tokenSecrets.name} until the ICO starts?`,
              default: false
            }
          ]).then(async (action) => {
            try {
              for (let i = 1; i <= answers.rounds; i++) {
                ico.rounds.push(await this.createRound(tokenSecrets, i));
              }

              if (action.pause) {
                await this.tokenAdministrate.pause(tokenSecrets);
              }

              await this.tokenICO.writeICO(ico);
              resolve(`ICO has been configured for ${tokenSecrets.name}`);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });
  }

  createRound(tokenSecrets, id) {
    return new Promise((resolve, reject) => {
      inquirer.prompt([
        {
          type: 'input',
          name: 'amount',
          message: `How many ${tokenSecrets.symbol} you wish to sell in round ${id}?`
        },
        {
          type: 'input',
          name: 'price',
          message: `What will be the USD price for ${tokenSecrets.symbol} in round ${id}?`
        },
        {
          type: 'input',
          name: 'name',
          message: `What's the name for round ${id}?`
        },
        {
          type: 'input',
          name: 'description',
          message: `What's the description for round ${id}?`
        }
      ]).then(async (round) => {
        try {
          // creating a dedicated treasury for the ICO...
          let treasury = await this.accountAPI.create();
          // associating the ICO wallet with the token...
          await this.tokenAdministrate.associate(tokenSecrets, treasury.accountId, treasury.privateKey);
          // if KYC key is there, we must enable KYC on the ICO treasury account...
          let kyc = tokenSecrets.keys.find(key => key.type == 'KYC');

          if (kyc) {
            await this.tokenAdministrate.enableKyc(tokenSecrets, treasury.accountId);
          }
          // moving the relative amount from treasury to ICO wallet...
          await this.tokenAdministrate.transfer(tokenSecrets, treasury.accountId, round.amount);

          resolve({
            id: id,
            amount: round.amount,
            price: round.price,
            name: round.name,
            description: round.description,
            treasury: treasury,
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

}

export default CreateICO