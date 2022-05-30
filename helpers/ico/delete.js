import inquirer from 'inquirer';
import TokenICO from '../io/tokenICO.js';
import TokenAdministrate from '../token/administrate.js';
import Account from '../../api/account.js';

class DeleteICO {
  client = null;
  environment = null;
  tokenICO = null;
  tokenAdministrate = null;
  accountAPI = null;  

  constructor(client, environment) {
    this.client = client;
    this.environment = environment;
    this.tokenICO = new TokenICO();

    this.tokenAdministrate = new TokenAdministrate(this.client, this.environment);
    this.accountAPI = new Account(this.client, this.environment);    
  }

  delete(tokenSecrets) {
    return new Promise(async(resolve, reject) => {
      try {
        let icos = await this.tokenICO.readICO();
        let tokenICO = icos.find(ico => ico.id == tokenSecrets.id);

        if(tokenICO) {
          // withdrawing all the tokens from each ICO wallets, and deleting them...
          for(let i = 0; i < tokenICO.rounds.length; i++) {
            let round = tokenICO.rounds[i];
            // withdrawing the whole amount from the old ICO wallet, into the main treasury...
            await this.tokenAdministrate.withdraw(tokenSecrets, round.treasury.accountId, round.treasury.privateKey, round.amount); 
            // finally, we can delete the old ICO wallet, cause we don't need it anymore...
            await this.accountAPI.delete(tokenSecrets, round.treasury.accountId, round.treasury.privateKey);                       
          };
          // finally, deleting the ICO from json...
          await this.tokenICO.deleteICO(tokenSecrets.id);
          resolve(`ICO has been removed for token ${tokenSecrets.name}`);
        } else {
          resolve(`There is no ICO for token ${tokenSecrets.name}`);
        }
      } catch(error) {
        reject(error);
      }
    });
  }  

}

export default DeleteICO