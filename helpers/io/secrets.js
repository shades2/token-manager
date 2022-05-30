import IO from './io.js';

class Secrets extends IO {

  constructor() {
    super('config/secrets.json');
  }

  readSecrets() {
    return new Promise(async(resolve, reject) => {
      try {
        const secrets = this.readFile();
        resolve(secrets);
      } catch(error) {
        reject(error);
      }
    });
  }

  writeSecrets(data) {
    return new Promise(async(resolve, reject) => {
      try {
        let secrets = await this.writeFile(data);
        resolve(secrets);
      } catch(error) {
        reject(error);
      }
    });
  }  

  updateSecrets(data) {
    return new Promise(async(resolve, reject) => {
      try {
        let secrets = await this.updateKey(data);
        resolve(secrets);           
      } catch(error) {
        reject(error);
      }
    });
  }

  deleteSecrets(tokenId) {
    return new Promise(async(resolve, reject) => {
      try {
        let secrets = await this.deleteKey(tokenId);
        resolve(secrets);
      } catch(error) {
        reject(error);
      }
    });
  }
}

export default Secrets