import fs from 'fs';

class IO {
  filePath;

  constructor(filePath) {
    this.filePath = filePath;
  }

  readFile() {
    return new Promise(async(resolve, reject) => {
      try {
        const data = fs.readFileSync(this.filePath, { flag: 'a+' });
        
        try {
          const content = JSON.parse(data);
          resolve(content);
        } catch(error) {
          resolve([]);
        }
        
      } catch(error) {
        reject(error);
      }
    });
  }

  writeFile(data) {
    return new Promise(async(resolve, reject) => {
      try {
        // reading previous content from file...
        let content = await this.readFile();
        // adding the new data into the content array...
        content.push(data);
        // saving the whole content to the file...
        fs.writeFileSync(this.filePath, JSON.stringify(content), { flag: 'w+' });
        resolve(content);
      } catch(error) {
        reject(error);
      }
    });
  }  

  updateKey(data) {
    return new Promise(async(resolve, reject) => {
      try {
        // reading previous content from file...
        let content = await this.readFile();
        // removing the old entry...
        content = content.filter(entry => entry.id != data.id); 
        // adding the new data entry into the array...
        content.push(data);
        // saving the whole content to the file...
        fs.writeFileSync(this.filePath, JSON.stringify(content), { flag: 'w+' });
        resolve(content);           
      } catch(error) {
        reject(error);
      }
    });
  }

  deleteKey(keyId) {
    return new Promise(async(resolve, reject) => {
      try {
        // reading previous content from file...
        let content = await this.readFile();
        // removing the old entry...
        content = content.filter(entry => entry.id != keyId);
        // saving the whole content to the file...
        fs.writeFileSync(this.filePath, JSON.stringify(content), { flag: 'w+' });
        resolve(content);
      } catch(error) {
        reject(error);
      }
    });
  }
 
}

export default IO