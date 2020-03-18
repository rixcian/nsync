const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Nsync {
  constructor(HOST='127.0.0.1', PORT = '6666', options = { server: false }) {
    this.HOST = HOST;
    this.PORT = PORT;
    this.server = options.server;
    this.clientSocket = null;
    this.serverSocket = null;
  }



  // Starts nsync server
  start() {
    if (this.server) {
      const { HOST, PORT } = this;
      const server = net.createServer((conn) => {
        //console.log(`👨 Client IP: ${conn.remoteAddress}`);
        console.log('\x1b[0m', `👨 Client connected`); 
        let fileName;
        let writeStream;

        conn.on('data', data => {
          if (data.length === 255 && data.slice(0, 9).toString() === 'filename>') {
            fileName = data.slice(9, data.length).toString('utf8').replace(/\0/g, '');
            writeStream = fs.createWriteStream(`${__dirname}/upload/${fileName}`);
          } else if (data.length === 41 && data.slice(0,9).toString() === 'checksum>') {

              const remoteFileSum = data.slice(9, data.length).toString();
              const localFileSum = crypto.createHash('md5');
              const localReadStream = fs.createReadStream(`${__dirname}/upload/${fileName}`);
              
              localReadStream.on('data', data => {
                localFileSum.update(data);
              });

              localReadStream.on('end', () => {
                if (remoteFileSum === localFileSum.digest('hex')) {
                  console.log('\x1b[0m', `✔️  ${fileName} was successfully transfered`);
                } else {
                  console.error('\x1b[31m', `❌ ERROR> ${fileName} transfer failed`);
                }
              });

          } else {
            writeStream.write(data);
          }
        });

        conn.on('close', () => {
          console.log('\x1b[0m', `👨 Client disconnected`);
        });

      });
      
      server.listen(PORT, HOST, () => {
        console.clear();
        console.log('\x1b[0m', `🚀 Server is running on port ${PORT}`)
      });
    } else {
      console.error('\x1b[31m', `❌ ERROR> Before using start(), in Nsync constructor you have to set "server" property to "true"`);
      process.exitCode = 1;
    }
  }



  // Connects client to nsync server
  connect = () => new Promise((resolve, reject) => {
    if (!this.server) {
      
      try {
        this.clientSocket = net.connect(this.PORT, this.HOST);
        console.log('\x1b[0m', `✔️  Connection to the server was successfull`);
        resolve();
      } catch (err) {
        console.error('\x1b[31m', `❌ ERROR> ${err}`);
        process.exitCode = 1;
        reject(err);
      }

    } else {
      console.error('\x1b[31m', `❌ ERROR> Before using start(), in Nsync constructor you have to set "server" property to "false"`);
      process.exitCode = 1;
      reject();
    }
  });



  // Disconnects client from nsync server
  disconnect() {
    if (!this.server && this.clientSocket) {
      this.clientSocket.end(() => {
        console.log('\x1b[0m', `✔️  You've been successfully disconnected from the server`);
        process.exitCode = 0;
      });
    }
  }



  // Send file to nsync server
  sendFile = (pathToFile) => new Promise((resolve, reject) => {
    try {
      if (!this.server && this.clientSocket) {
        fs.stat(pathToFile, err => {
          if (!err) {
            const fileName = path.basename(pathToFile);
            let localFileSum = crypto.createHash('md5');
            
            const localReadStream = fs.createReadStream(pathToFile);  
            localReadStream.on('data', data => {
              localFileSum.update(data);
            });
            localReadStream.on('end', () => {
              localFileSum = localFileSum.digest('hex');
            });

            const fileNameBuff = Buffer.alloc(255);
            fileNameBuff.write(`filename>${fileName}`, 'utf8');
            this.clientSocket.write(fileNameBuff);

            const fileReadStream = fs.createReadStream(pathToFile);
            fileReadStream.pipe(this.clientSocket, { end: false });
            fileReadStream.on('close', () => {
              const checksumBuff = Buffer.alloc(41, `checksum>${localFileSum}`, 'utf8');
              this.clientSocket.end(checksumBuff);
              
              console.log('\x1b[0m', `✔️  ${path.basename(pathToFile)} was successfully sent to the server`);
              resolve();
            });

          } else {
            console.error('\x1b[31m', `❌ ERROR> ${err}`);
            reject(err);
          }
        });

      } else {
        console.error('\x1b[31m', `❌ ERROR> You're server or you aren't connected to the server!`);
        reject(`❌ ERROR> You're server or you aren't connected to the server!`);
      }
    } catch (err) {
      console.error('\x1b[31m', `❌ ERROR> ${err}`);
      reject(err);
    }
  });



  // Send whole directory to the nsync server
  sendDirectory = (pathToDirectory) => new Promise((resolve, reject) => {
    try {
      if (!this.server && this.clientSocket) {
        // 1. Checknout jestli složka existuje
        // 2. Rekurzivně projet složku a všechny soubory, co jsou v ní naházet do fronty
        // 3. Projet frontu (každá položka je string s absolutní cestou k souboru)
        //    a na každé položce zavolat funkci this.sendFile(pathToFile) 
      } else {
        console.error('\x1b[31m', `❌ ERROR> You're server or you aren't connected to the server!`);
        reject(`❌ ERROR> You're server or you aren't connected to the server!`);
      }
    } catch (err) {
      console.error('\x1b[31m', `❌ ERROR> ${err}`);
      reject(err);
    }
  }); 

}

module.exports = Nsync;