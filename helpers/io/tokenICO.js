import IO from './io.js';

class TokenICO extends IO {
  safeIO = null;

  constructor() {
    super('config/ico_secrets.json');
    this.safeIO = new IO('config/token_ico.json');
  }

  readICO() {
    return new Promise(async(resolve, reject) => {
      try {
        const ico = this.readFile();
        resolve(ico);
      } catch(error) {
        reject(error);
      }
    });
  }

  writeICO(data) {
    return new Promise(async(resolve, reject) => {
      try {
        let ico = await this.writeFile(data);

        data.rounds.forEach(round => {
          delete round.treasury;
        });

        this.safeIO.writeFile(data);        
        resolve(ico);
      } catch(error) {
        reject(error);
      }
    });
  }  

  updateICO(data) {
    return new Promise(async(resolve, reject) => {
      try {
        let ico = await this.updateKey(data);

        data.rounds.forEach(round => {
          delete round.treasury;
        });

        this.safeIO.updateKey(data);
        resolve(ico);           
      } catch(error) {
        reject(error);
      }
    });
  }

  deleteICO(id) {
    return new Promise(async(resolve, reject) => {
      try {
        let ico = await this.deleteKey(id);
        this.safeIO.deleteKey(id);
        resolve(ico);
      } catch(error) {
        reject(error);
      }
    });
  }
}

export default TokenICO