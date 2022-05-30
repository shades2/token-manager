# HSuite - Token Manager
## Description

A Command Line Tool, to easily deal with accounts/tokens administration.
Meant to be run locally, for security reasons.

This script will be reading/writing from/to a file called secrets.json,
containing all the sensitive information about your tokens/accounts/keys.

We heavily recommend to store the secrets.json file into a very safe place, and put it back in the config folder whenever you need to use the CLI tool.

## Installation
Once you download this repository, you can install all the dependencies by running:

```bash
# install dependencies...
$ yarn install
```

Once dependencies are installed, you need to create a config folder, with an empty secrets.json file in it:
```bash
# create the config directory...
$ mkdir config
# create an empty secrests.json
$ touch config/secrets.json
```

## Configuration
you must create a .env file, containing:

```bash
# testnet operator...
DEV_OPERATOR_ACCOUNT=X.X.XXXXXXX
DEV_OPERATOR_PUBLIC_KEY=XXXXXXXXXXXXXXXXXXXXXX
DEV_OPERTOR_PRIVATE_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# mainnet operator...
PROD_OPERATOR_ACCOUNT=X.X.XXXXXXX
PROD_OPERATOR_PUBLIC_KEY=XXXXXXXXXXXXXXXXXXXXXX
PROD_OPERATOR_PRIVATE_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Those will be the operators used by the script for testnet and mainnet actions.
Please be sure to have enough HBAR into those operators accounts when running the CLI.

## How to Use it
You can run the CLI with the command: 
```bash
# run the CLI, and enjoy it...
$ node index.js
```

### Features
- work both on Production and Development (mainnet / testnet)
- you can create both fungible tokens and NFT
- you can update any of the tokens you've been creating previously (memo, symbol, keys, etc)
- you can administrate a token (swap / transfer / withdraw / delete / mint / burn / freeze / unfreeze / KYC / associate / disassociate / pause / unpause / wipe)
- setup ICO (it will help you in creating the ICO wallets for each round, and automatically associate the wallets with the tokenID and top them up with the amount you wish to put into the ICO round itself)