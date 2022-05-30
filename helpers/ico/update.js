import inquirer from 'inquirer';
import TokenICO from '../io/tokenICO.js';
import TokenAdministrate from '../token/administrate.js';
import Account from '../../api/account.js';

class UpdateICO {
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

  update(token) {
    return new Promise(async(resolve, reject) => {
      try {
        let icos = await this.tokenICO.readICO();
        let tokenICO = icos.find(ico => ico.id == token.id);

        if(tokenICO) {
          inquirer.prompt(
            {
              type: 'list',
              message: 'Do you want to add a round, or modify an existing one?',
              name: 'type',
              choices: ['Add a new round', 'Modify an existing one']
            }            
          ).then(async(action) => {
            try {
              switch(action.type) {
                case 'Add a new round':
                  tokenICO.rounds.push(await this.addRound(token, tokenICO.rounds.length + 1));
                  break;
                case 'Modify an existing one':
                  tokenICO = await this.modifyRound(token, tokenICO);
                  break;           
              }

              await this.tokenICO.updateICO(tokenICO);
              resolve(`Rounds have been added/updated for ${token.name}'s ICO`);
            } catch(error) {
              reject(error);
            }
          });
        } else {
          resolve(`There is no ICO for token ${token.name}`);
        }
      } catch(error) {
        reject(error);
      }
    });
  }

  addRound(tokenSecrets, id) {
    return new Promise(async(resolve, reject) => {
      inquirer.prompt([
        {
          type: 'input',
          name: 'amount',
          message: `How many ${tokenSecrets.symbol} you wish to sell in this new round?`
        },
        {
          type: 'input',
          name: 'price',
          message: `What will be the USD price for ${tokenSecrets.symbol} in this new round?`
        },
        {
          type: 'input',
          name: 'name',
          message: `What's the name for this new round?`
        },
        {
          type: 'input',
          name: 'description',
          message: `What's the description for this new round?`
        }            
      ]).then(async(round) => {
        try {
          // creating a dedicated treasury for the ICO...
          let treasury = await this.accountAPI.create();
          // associating the ICO wallet with the token...
          await this.tokenAdministrate.associate(tokenSecrets, treasury.accountId, treasury.privateKey);
          // if KYC key is there, we must enable KYC on the ICO treasury account...
          let kyc = tokenSecrets.keys.find(key => key.type == 'KYC');
          
          if(kyc) {
            await this.tokenAdministrate.enableKyc(tokenSecrets, treasury.accountId);
          }
          // moving the relative amount from treasury to ICO wallet...
          await this.tokenAdministrate.transfer(tokenSecrets, treasury.accountId, round.amount);

          resolve({
            id: id,
            ...round,
            treasury: treasury,
          });          
        } catch(error) {
          reject(error);
        }
      });      
    })
  }  

  modifyRound(token, tokenICO) {
    return new Promise(async(resolve, reject) => {
      inquirer.prompt(
        {
          type: 'checkbox',
          message: 'Select the round you want to modify',
          name: 'selected',
          choices: tokenICO.rounds.map(round => {
            return {
              name: round.id,
              checked: true                  
            }
          }),
          validate(answer) {
            if (answer.length < 1) {
              return 'You must choose at least one.';
            }

            return true;
          }
        }            
      ).then(async(rounds) => {
        try {
          for(let i = 0; i < rounds.selected.length; i++) {
            let selected = rounds.selected[i];
            let roundIndex = tokenICO.rounds.findIndex(round => round.id == selected);          
            tokenICO.rounds[roundIndex] = await this._modifyRound(token, tokenICO.rounds[roundIndex]);
          };
  
          resolve(tokenICO);          
        } catch(error) {
          reject(error);
        }
      });
    });
  }

  _modifyRound(tokenSecrets, round) {
    return new Promise(async(resolve, reject) => {
      inquirer.prompt([
        {
          type: 'input',
          name: 'amount',
          message: `How many ${tokenSecrets.symbol} you wish to sell in round ${round.id}?`
        },
        {
          type: 'input',
          name: 'price',
          message: `What will be the USD price for ${tokenSecrets.symbol} in round ${round.id}?`
        },
        {
          type: 'input',
          name: 'name',
          message: `What's the name for round ${round.id}?`
        },
        {
          type: 'input',
          name: 'description',
          message: `What's the description for round ${round.id}?`
        },
        {
          type: 'confirm',
          name: 'change_treasury',
          message: `Do you want to change treasury for round ${round.id}?`,
          default: false
        }                  
      ]).then(async(newRound) => {
        try {
          // if the updated round has a bigger amount than the old one,
          // then we shall add the token difference into the ICO wallet...
          if(Number(newRound.amount) > Number(round.amount)) {
            await this.tokenAdministrate.transfer(tokenSecrets, round.treasury.accountId, newRound.amount - round.amount);
          } 
          // otherwise, we shall withdraw the token difference from the ICO wallet,
          // and send it back to the main treasury...
          else {
            if(Number(newRound.amount) < Number(round.amount)) {
              await this.tokenAdministrate.withdraw(tokenSecrets, round.treasury.accountId, round.treasury.privateKey, round.amount - newRound.amount);
            }
          }
          
          // once all the math updates are done, we check if the ICO wallet address needs to be changed...
          let treasury = round.treasury;

          if(newRound.change_treasury) {
            // creating a dedicated treasury for the ICO...
            treasury = await this.accountAPI.create();
            // associating the ICO wallet with the token...
            await this.tokenAdministrate.associate(tokenSecrets, treasury.accountId, treasury.privateKey);
            // if KYC key is there, we must enable KYC on the ICO wallet account...
            let kyc = tokenSecrets.keys.find(key => key.type == 'KYC');
            
            if(kyc) {
              await this.tokenAdministrate.enableKyc(tokenSecrets, treasury.accountId);
            }
            // withdrawing the whole amount from the old ICO wallet, into the main treasury...
            await this.tokenAdministrate.withdraw(tokenSecrets, round.treasury.accountId, round.treasury.privateKey, newRound.amount);
            // moving the relative amount from treasury to ICO wallet...
            await this.tokenAdministrate.transfer(tokenSecrets, treasury.accountId, newRound.amount);
            // finally, we can delete the old ICO wallet, cause we don't need it anymore...
            await this.accountAPI.delete(tokenSecrets, round.treasury.accountId, round.treasury.privateKey);
          }

          // clean up object property...
          delete newRound.change_treasury;

          resolve({
            id: round.id,
            ...newRound,
            treasury: treasury,
          });          
        } catch(error) {
          reject(error);
        }
      });      
    })
  }

}

export default UpdateICO