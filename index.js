import inquirer from 'inquirer';
import Api from './api/api.js';
let api = new Api();

function init() {
  inquirer.prompt(
    {
      type: 'list',
      name: 'environment',
      message: 'Which environment do you want to work with?',
      choices: ['Development', 'Production'],
    }    
  ).then(async(answers) => {
    switch(answers.environment) {
      case 'Development':
        api.initClient('testnet');
        actions();
        break;
      case 'Production':
        api.initClient('mainnet');
        actions();
        break;      
    }
  });
}

function actions() {
  inquirer.prompt(
    {
      type: 'list',
      name: 'actions',
      message: 'Hedera Client is ready, what do you want to do next?',
      choices: [
        'Create a Token', 
        'Update a Token', 
        'Administrate a Token',
        'Setup ICO for Token',
      ],
    }    
  ).then(async(answers) => {
    switch(answers.actions) {
      case 'Create a Token':
        try {
          let treasury = await api.account.create();
          let token = await api.token.create(treasury);
          console.log(`the token ${token.name} has been created!`);          
        } catch(error) {
          console.error(error.message);
        }
        break;
      case 'Update a Token':
        try {
          let response = await api.token.update();
          console.log(response);
        } catch(error) {
          console.error(error.message);
        }        
        break;
      case 'Administrate a Token':
        try {
          let response = await api.token.administrate();
          console.log(response);
        } catch(error) {
          console.error(error.message);
        }
        break;
      case 'Setup ICO for Token':
        try {
          let response = await api.ico.setup();
          console.log(response);
        } catch(error) {
          console.error(error.message);
        }
        break;
    }
  });
}

init();