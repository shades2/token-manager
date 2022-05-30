import inquirer from 'inquirer';
import Secrets from '../helpers/io/secrets.js';
import Rounds from '../helpers/io/tokenICO.js';

import CreateICO from '../helpers/ico/create.js';
import UpdateICO from '../helpers/ico/update.js';
import DeleteICO from '../helpers/ico/delete.js';

class ICO {
  client = null;
  environment = null;
  secrets = null;
  createICO = null;
  updateICO = null;
  deleteICO = null;

  constructor(client, environment) {
    this.client = client;
    this.environment = environment;
    this.secrets = new Secrets();
    this.rounds = new Rounds();

    this.createICO = new CreateICO(this.client, this.environment);
    this.updateICO = new UpdateICO(this.client, this.environment);
    this.deleteICO = new DeleteICO(this.client, this.environment);
  }

  setup() {
    return new Promise(async(resolve, reject) => {
      // reading secrets from file...
      let secrets = await this.secrets.readSecrets();
      // mapping the tokens into a data struct, 
      // filtered by selected environment...
      let tokens = secrets.filter(
        secret => secret.environment == this.environment
      );

      inquirer.prompt(
        {
          type: 'list',
          name: 'id',
          message: 'Which token do you want to create/modify ICO for?',
          choices: tokens.map(token => {
            return {
              name: `${token.name} (${token.symbol} - ${token.id})`,
              value: token.id
            }
          }),
        }        
      ).then(async(selectedToken) => {
        let tokenSecrets = tokens.find(token => token.id == selectedToken.id);

        inquirer.prompt(
          {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: [
              'Create ICO', 
              'Update ICO',
              'Delete ICO',
            ],
          }    
        ).then(async(answers) => {
          try {
            let response = null;

            switch(answers.action) {
              case 'Create ICO':
                response = await this.createICO.create(tokenSecrets);
                break;
              case 'Update ICO':
                response = await this.updateICO.update(tokenSecrets);
                break;
              case 'Delete ICO':
                response = await this.deleteICO.delete(tokenSecrets);
                break;                
            }

            resolve(response);
          } catch(error) {
            reject(error);
          }
        });
      });
    });
  }  
}

export default ICO